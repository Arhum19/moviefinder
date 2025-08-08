const API_URL = "http://www.omdbapi.com/?apikey=355a7b6a";
let currentPage = 1;
let currentQuery = "";
let currentType = "";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function toggleMode() {
  document.body.classList.toggle("light");
}

async function searchMovies(page = 1) {
  const query = document.getElementById("searchInput").value.trim();
  const type = document.getElementById("typeSelect").value;
  const movieContainer = document.getElementById("movieContainer");
  const pageNumber = document.getElementById("pageNumber");

  if (query !== currentQuery) currentPage = 1;

  currentQuery = query;
  currentType = type;
  currentPage = page;

  movieContainer.innerHTML = "<p>Loading...</p>";

  if (!query) {
    movieContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_URL}&s=${query}&type=${type}&page=${page}`);
    const data = await response.json();

    if (data.Response === "True") {
      movieContainer.innerHTML = data.Search.map((movie) => `
        <div class="movie-card">
          <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" onclick="openModal('${movie.imdbID}')" />
          <h3>${movie.Title}</h3>
          <p>${movie.Year} | ${movie.Type}</p>
          <button onclick="addToFavorites('${movie.imdbID}')">❤️ Add to Watchlist</button>
        </div>
      `).join("");
      pageNumber.textContent = `Page ${currentPage}`;
    } else {
      movieContainer.innerHTML = `<p>${data.Error}</p>`;
    }
  } catch (error) {
    movieContainer.innerHTML = "<p>Error fetching data.</p>";
    console.error(error);
  }
}

function changePage(direction) {
  const newPage = currentPage + direction;
  if (newPage < 1) return;
  searchMovies(newPage);
}

async function openModal(imdbID) {
  const modal = document.getElementById("movieModal");
  const modalDetails = document.getElementById("modalDetails");

  modal.style.display = "flex";
  modalDetails.innerHTML = "Loading...";

  try {
    const response = await fetch(`${API_URL}&i=${imdbID}&plot=full`);
    const data = await response.json();

    if (data.Response === "True") {
      modalDetails.innerHTML = `
        <img src="${data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" />
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Director:</strong> ${data.Director}</p>
        <p><strong>Actors:</strong> ${data.Actors}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
      `;
    } else {
      modalDetails.innerHTML = `<p>${data.Error}</p>`;
    }
  } catch (error) {
    modalDetails.innerHTML = "<p>Error loading details.</p>";
    console.error(error);
  }
}

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}
// Close modal when clicking outside the modal content
window.addEventListener("click", (e) => {
  const modal = document.getElementById("movieModal");
  if (e.target === modal) {
    closeModal();
  }
});


function addToFavorites(imdbID) {
  if (!favorites.includes(imdbID)) {
    favorites.push(imdbID);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
}

async function loadFavorites() {
  const favoritesContainer = document.getElementById("favoritesContainer");
  favoritesContainer.innerHTML = "";

  for (const id of favorites) {
    try {
      const response = await fetch(`${API_URL}&i=${id}`);
      const movie = await response.json();
      favoritesContainer.innerHTML += `
        <div class="movie-card">
          <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" onclick="openModal('${movie.imdbID}')" />
          <h3>${movie.Title}</h3>
          <p>${movie.Year} | ${movie.Type}</p>
        </div>
      `;
    } catch (error) {
      console.error("Error loading favorite:", error);
    }
  }
}

window.onload = () => {
  loadFavorites();
};