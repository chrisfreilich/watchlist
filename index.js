const headerEl = document.getElementById('header')
const searchBarEl = document.getElementById('search-bar')
const searchTitleEl = document.getElementById('search-title')
const searchBtn = document.getElementById('search-btn')

// Keep the search bar locked in place.
searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight/2)
window.addEventListener('resize', handleWindowResize)

// Search
searchBarEl.addEventListener('submit', (e) => {
    e.preventDefault()
    const searchString = searchTitleEl.value.trim()
    if (!searchString) return
    fetch(`http://www.omdbapi.com/?s=${searchString}&apikey=88ae5a67`)
        .then( res => res.json() )
        .then( data => processSearchResults(data))
})

function processSearchResults(data) {
    let html = ""
    let filmIDs = []
    for ( const film of data.Search) {
        // In this function, add the elements, but we're going to need to do
        // another API for each movie to get the details of the film (kind of weird design of the API, methinks!)
        html += `<div class='film-card' id=${film.imdbID}></div><hr>`
        filmIDs.push(film.imdbID)
    }
    document.getElementById('search-results').innerHTML = html

    // Now that we have the elements in place, we can call the API to fill in the data
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
            // Set show more visibility
            const plot = document.querySelectorAll(`.film-plot-block[data-id=${id}]`)[0]
            const link = document.querySelectorAll(`.show-more[data-id=${id}]`)[0]
            link.style.display = plot.clientHeight < plot.scrollHeight ? "inline" : "none"
        })
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