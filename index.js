//--- Imports ---//
import { pgPageEls, paginatorEl, renderFilmList, updateShowMoreLinks, handleResultsClick} from './shared.js'

//--- Variable Declarations ---//
const headerEl = document.getElementById('header')
const searchBarEl = document.getElementById('search-bar')
const searchTitleEl = document.getElementById('search-title')
const resultsEl = document.getElementById('search-results')

//--- Place the search bar (placement is down to the pixel of screen size, so no media query). ---//
searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight / 2)

//--- Event handlers ---//
window.addEventListener('resize', handleWindowResize)       // UI responds to any resize
paginatorEl.addEventListener('click', handlePaginatorClick) // Paginator action
resultsEl.addEventListener('click', handleResultsClick)     // Add/Remove from Watchlist
searchBarEl.addEventListener('submit', (e) => {             // Search form submit
    e.preventDefault()
    doSearch(1, "start")
})

//--- Functions ---/
function doSearch(page = 1, offsetPage = "none") {
    const searchString = searchTitleEl.value.trim()
    if (!searchString) return
    fetch(`http://www.omdbapi.com/?s=${searchString}&page=${page}&apikey=88ae5a67`)
        .then(res => res.json())
        .then(data => renderFilmList(data, page, offsetPage))
}

function handleWindowResize() {
    searchBarEl.style.top = headerEl.offsetHeight - (searchBarEl.offsetHeight / 2)
    updateShowMoreLinks()
}

function handlePaginatorClick(e) {
    if (e.target.classList.contains('paginator-page')) {
        doSearch(e.target.innerText)
    } else if (e.target.classList.contains('paginator-back')) {
        doSearch(Number(pgPageEls[0].innerHTML) - 1, "back")
    } else if (e.target.classList.contains('paginator-next')) {
        doSearch(Number(pgPageEls[4].innerHTML) + 1, "next")
    } 
}

