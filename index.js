const headerEl = document.getElementById('header')
const searchBarEl = document.getElementById('search-bar')
const searchTitleEl = document.getElementById('search-title')
const searchBtn = document.getElementById('search-btn')

// Pagination variables
const paginatorEl = document.getElementById('paginator')
const pgNextBtn = document.getElementById('paginator-next')
const pgBackBtn = document.getElementById('paginator-back')
const pgPageEls = document.getElementsByClassName('paginator-page')
let pgResultPages = 0

// Keep the search bar locked in place.
searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight/2)
window.addEventListener('resize', handleWindowResize)

// Search
searchBarEl.addEventListener('submit', (e) => {
    e.preventDefault()
    doSearch(1, "start")
})

function doSearch(page = 1, offsetPage = "none") {
    const searchString = searchTitleEl.value.trim()
    if (!searchString) return
    fetch(`http://www.omdbapi.com/?s=${searchString}&page=${page}&apikey=88ae5a67`)
        .then( res => res.json() )
        .then( data => processSearchResults(data, page, offsetPage))
}

function processSearchResults(data, page, offsetPage) {

    // Check for no results
    if (!data.Search) {
        document.getElementById('search-results').innerHTML = `
                <p class="blank-screen-text">No Luck! No Matches!</p>
                <img src="images/no-results.png" class="blank-screen"/>
        `
        paginatorEl.style.display = "none"
        return
    }

    // The search API only returns essentials of each film, so
    // another API call is necessary for each movie to get the details of the film 
    let html = ""
    let filmIDs = []
    for (const film of data.Search) {
        html += `<div class='film-card' id=${film.imdbID}></div><hr>`
        filmIDs.push(film.imdbID)
    }
    document.getElementById('search-results').innerHTML = html

    // Now that we have the HTML elements in place for each film, we can call the API to fill in the data
    for (const id of filmIDs) {
        fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=88ae5a67`)
        .then( res => res.json() )
        .then( data => {
            // Calculate Rotten Tomatoes stuff
            let rtRating = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")
            rtRating = rtRating ? rtRating.Value : ""
            let rtIcon
            let rtRatingAlt
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
                        <p class="runtime">${data.Runtime}</p>
                        <p class="genre">${data.Genre}</p>
                        <div class="watchlist-btn-container" data-id="${id}">    
                            <img src="/images/plus-icon.png" alt="Button to Add ${data.Title} to Watchlist" />
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

    // Paginate based on offset page and page
    currentResultPages = Math.ceil(parseInt(data.totalResults) / 10)    // 10 films returned per request, so making the pages that length.
    if (currentResultPages > 2) { 
        const numPageLinks = Math.min(currentResultPages, 5)                // Display up to 5 page links 
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
                const remainingPages = currentResultPages - currentStartPage
                if (remainingPages < 5) numPageLinks = remainingPages
                break
            default:
                break
        }

        // set numbers + selected
        paginatorEl.style.display = "flex"
        for (let i = 0; i < 5; i++) {
            curPage = currentStartPage + i
            pgPageEls[i].textContent = curPage
            pgPageEls[i].style.display = numPageLinks > i  ? "block" : "none"
            if (page === curPage)
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
    searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight/2)
    updateShowMoreLinks()
}

function revealFullPlot(event) {
    event.preventDefault()
    event.target.style.display = "none"
    const card = document.getElementById(event.target.dataset.id)
    card.style.gridTemplateRows =  "auto auto auto"
}