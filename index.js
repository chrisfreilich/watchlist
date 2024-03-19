//--- Variable Declarations ---//
const headerEl = document.getElementById('header')
const searchBarEl = document.getElementById('search-bar')
const searchTitleEl = document.getElementById('search-title')
const searchBtn = document.getElementById('search-btn')
const resultsEl = document.getElementById('search-results')
const paginatorEl = document.getElementById('paginator')
const pgNextBtn = document.getElementById('paginator-next')
const pgBackBtn = document.getElementById('paginator-back')
const pgPageEls = document.getElementsByClassName('paginator-page')
//let pgResultPages = 0

//--- Place the search bar (placement is down to the pixel of screen size, so no media query). ---//
searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight / 2)

//--- Event handlers ---//
window.addEventListener('resize', handleWindowResize)   // UI responds to any resize
searchBarEl.addEventListener('submit', (e) => {         // Search form submit
    e.preventDefault()
    doSearch(1, "start")
})
paginatorEl.addEventListener('click', handlePaginatorClick) // Paginator action
resultsEl.addEventListener('click', handleResultsClick)     // Add/Remove from Watchlist

//--- Functions ---/
function doSearch(page = 1, offsetPage = "none") {
    const searchString = searchTitleEl.value.trim()
    if (!searchString) return
    fetch(`http://www.omdbapi.com/?s=${searchString}&page=${page}&apikey=88ae5a67`)
        .then(res => res.json())
        .then(data => processSearchResults(data, page, offsetPage))
}

function processSearchResults(data, page, offsetPage) {

    // Scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Check for no results
    if (!data.Search) {
        document.getElementById('search-results').innerHTML = `
                <p class="blank-screen-text">No Luck! No Matches!</p>
                <img src="images/no-results.png" class="blank-screen"/>
        `
        paginatorEl.style.display = "none"
        return
    }

    // The search API only returns essentials of each film, so first
    // create cards for each film. Afterwards, another API call
    // will be necessary for each movie to get the details of the film 
    let html = ""
    let filmIDs = []
    for (const film of data.Search) {
        html += `<div class='film-card' id=${film.imdbID}></div><hr>`
        filmIDs.push(film.imdbID)
    }
    document.getElementById('search-results').innerHTML = html

    // Now that we have the film-card elements in place for each film, we can call the API to fill in the data
    for (const id of filmIDs) {
        fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=88ae5a67`)
            .then(res => res.json())
            .then(data => {
                // Calculate Rotten Tomatoes and film info
                let rtRating = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")
                rtRating = rtRating ? rtRating.Value : ""
                let rtIcon
                let rtRatingAlt
                let genre = ""
                let runtime = ""
                if (!rtRating || rtRating === "N/A") {
                    rtIcon = "images/tomatometer-empty.svg"
                    rtRating = ""
                    rtRatingAlt = "No Rotten Tomatoes Rating"
                } else if (parseInt(rtRating, 10) < 60) {
                    rtIcon = "images/tomatometer-rotten.svg"
                    rtRatingAlt = "Rotten Tomatoes Rotten Rating"
                } else {
                    rtIcon = "images/tomatometer-fresh.svg"
                    rtRatingAlt = "Rotten Tomatoes Fresh Rating"
                }
                runtime = data.Runtime === "N/A" ? "" : data.Runtime
                genre = data.Genre === "N/A" ? "" : data.Genre

                document.getElementById(id).innerHTML = `
                    <img class="poster" src="${data.Poster === 'N/A' ? 'images/no-poster.jpg' : data.Poster}" alt="">
                    <div class="film-title-block">
                        <h4>${data.Title}</h4>
                        <div class="rt">
                            <img src="${rtIcon}" alt="${rtRatingAlt}" />
                            <p>${rtRating}</p>
                        </div>
                    </div>
                    <div class="film-info-block">
                        ${runtime && `<p class="runtime">${runtime}</p>`}
                        ${genre && `<p class="genre">${genre}</p>`}
                        <div class="watchlist-btn-container" data-id="${id}">    
                            <img src="/images/${localStorage.getItem(id) ? "minus" : "plus"}-icon.png" alt="Button to Add ${data.Title} to Watchlist" />
                            <p class="watchlist-btn">Watchlist</p>
                        </div>
                    </div>
                    <div class="film-plot-block" data-id="${id}">
                        <span>${data.Plot === "N/A" ? "No description available." : data.Plot}</span>
                        <a href="#" class="show-more" data-id="${id}">(show more)</a>
                    </div>           
            `
                // Set (show more) visibility
                const plot = document.querySelectorAll(`.film-plot-block[data-id=${id}]`)[0]
                const link = document.querySelectorAll(`.show-more[data-id=${id}]`)[0]
                link.addEventListener('click', revealFullPlot)
                link.style.display = plot.clientHeight < plot.scrollHeight ? "inline" : "none"
            })
    }

    // Paginator
    currentResultPages = Math.ceil(parseInt(data.totalResults) / 10)    // 10 films returned per request, so making the pages that length.
    if (currentResultPages > 1) {
        let numPageLinks = Math.min(currentResultPages, 5)            // Display up to 5 page links 
        let currentStartPage = Number(pgPageEls[0].textContent)
        switch (offsetPage) {
            case "start":
                currentStartPage = 1
                break
            case "back":
                currentStartPage -= 5
                break
            case "next":
                currentStartPage += 5
                const remainingPages = currentResultPages - (currentStartPage - 1)
                if (remainingPages < 5) numPageLinks = remainingPages
                break
            default:
                break
        }

        // set numbers + selected
        paginatorEl.style.display = "flex"
        for (let i = 0; i < 5; i++) {
            const curPage = currentStartPage + i
            pgPageEls[i].textContent = curPage
            pgPageEls[i].style.display = numPageLinks > i ? "block" : "none"
            if (page == curPage)
                pgPageEls[i].classList.add("current")
            else
                pgPageEls[i].classList.remove("current")
        }

        // Enable/disable next/back
        pgBackBtn.disabled = (currentStartPage === 1)
        pgNextBtn.disabled = (currentStartPage + 5 >= currentResultPages)

        // if there are not enough pages to utilize the back/next buttons, hide them
        pgBackBtn.style.display = currentResultPages <= 5 ? "none" : "block"
        pgNextBtn.style.display = currentResultPages <= 5 ? "none" : "block"
    } else {
        paginatorEl.style.display = "none"
    }

}

function updateShowMoreLinks() {
    for (const plot of document.getElementsByClassName('film-plot-block')) {
        const link = document.querySelectorAll(`.show-more[data-id=${plot.dataset.id}]`)[0]
        link.style.display = plot.clientHeight < plot.scrollHeight ? "inline" : "none"
    }
}

function handleWindowResize() {
    searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight / 2)
    updateShowMoreLinks()
}

function revealFullPlot(event) {
    event.preventDefault()
    event.target.style.display = "none"
    const card = document.getElementById(event.target.dataset.id)
    card.style.gridTemplateRows = "auto auto auto"
}

function handlePaginatorClick(e) {
    if (e.target.classList.contains('paginator-page')) {
        doSearch(e.target.innerText)
    } else if (e.target.classList.contains('paginator-back')) {
        doSearch(Number(pgPageEls[0].innerHTML) - 1, "back")
    } else if (e.target.classList.contains('paginator-next')) {
        doSearch(Number(pgPageEls[4].innerHTML) + 1, "next")
    } else {
        return
    }
}

function handleResultsClick(e) {
    if (e.target.classList.contains('watchlist-btn-container')) {
        let inList = false
        if (localStorage.getItem(e.target.dataset.id)) {
            // Remove from watchlist
            localStorage.removeItem(e.target.dataset.id)
        } else {
            // Add to watchlist
            localStorage.setItem(e.target.dataset.id, e.target.dataset.id)
            inList = true
        }
        e.target.innerHTML = `
                                <img src="/images/${inList ? "minus" : "plus"}-icon.png" alt="Button to Add or Remove ${e.target.dataset.id} to Watchlist" />
                                <p class="watchlist-btn">Watchlist</p>
                            `
    }
}