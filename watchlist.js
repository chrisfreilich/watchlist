//--- Imports ---//
import { pgPageEls, paginatorEl, renderFilmList, updateShowMoreLinks } from './shared.js'

//--- Variable Declarations ---//
const resultsEl = document.getElementById('search-results')
let currentPage = 1

//--- Event handlers ---//
window.addEventListener('resize', handleWindowResize)       // UI responds to any resize
paginatorEl.addEventListener('click', handlePaginatorClick) // Paginator action
resultsEl.addEventListener('click', handleResultsClick)     // Add/Remove from Watchlist

//--- Functions ---/
function doSearch(page = 1, offsetPage = "none", scroll = true) {
    // Create a data object that matches the API response that we 
    // can send to the renderFilmList function
    let searchArray = []
    const  keyArray =  Object.keys(localStorage)
    const  startIndex = (page - 1) * 10 // 10 items per page
    const endIndex = startIndex + 9 > keyArray.length - 1 ? keyArray.length - 1 : startIndex + 9
    for (let i = startIndex; i <= endIndex; i++) {
        searchArray.push({imdbID: keyArray[i]})
    } 
    const data = {
        Search: searchArray,
        totalResults: keyArray.length
    }

    renderFilmList(data, page, offsetPage, scroll, `Your watchlist is empty. Go <a href="index.html">find some films</a>!`, 'images/empty.png')
    currentPage = Number(page)
}

function handleWindowResize() {
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

function handleResultsClick(e) {
    if (e.target.classList.contains('watchlist-btn-container')) {

            const listLength = Object.keys(localStorage).length
            // Remove from watchlist and rerender
            localStorage.removeItem(e.target.dataset.id)

            // Edge case,
            // (a) user removed last item on the watchlist,
            // (b) that item was the only item on the page, and
            // (c) it wasn't the only page. 
            // In this case, we need to back up one page
            if (currentPage != 1 && currentPage === Math.ceil(listLength / 10) && listLength % 10 === 1 ){
                doSearch(currentPage - 1, "back", false)
            }

            doSearch(currentPage, "none", false)
    }
}

doSearch()