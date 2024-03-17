const headerEl = document.getElementById('header')
const searchBarEl = document.getElementById('search-bar')
const searchTitleEl = document.getElementById('search-title')
const searchBtn = document.getElementById('search-btn')

// Keep the search bar locked in place.
searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight/2)
window.addEventListener('resize', ()=>searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight/2))

// Search
// searchBtn.addEventListener('click', doSearch)
searchBarEl.addEventListener('submit', (e) => {
    e.preventDefault()
    fetch(`http://www.omdbapi.com/?s=${searchTitleEl.value.trim()}&apikey=88ae5a67`)
    .then( res => res.json() )
    .then( data => processSearchResults(data))
})

function processSearchResults(data) {
    let html = ""
    for ( const film of data.Search) {
        html += `<div class='film-card'>

        ${film.Title}
        
        
        </div>`
    }
    document.getElementById('search-results').innerHTML = html
}