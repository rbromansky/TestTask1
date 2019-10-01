import "./styles.css";
const auth = "api_key=db46dece2e885108084accafeff9f1e5";
let pageNumberPopular = 1;
let pageNumberTopRated = 1;

class DataService {
  async getTVShows(name, page) {
    return (await fetch(
      `https://api.themoviedb.org/3/tv/${name}?page=${page}&${auth}`
    )).json();
  }

  async getTVShowDetail(id) {
    return (await fetch(
      `https://api.themoviedb.org/3/tv/${id}?${auth}`
    )).json();
  }

  async getSeasonDetail(tvId, seasonNumber) {
    return (await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?${auth}`
    )).json();
  }

  async getEpisodeDetail(tvId, seasonNumber, episodeNumber) {
    return (await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?${auth}`
    )).json();
  }
}

class ShowService {
  async displayPage(name) {
    let pageInput = document.getElementById(name + 2);
    let pageNumber = 1;

    if (pageInput !== null) {
      pageNumber = pageInput.value;
    } else {
      pageNumber = name === "popular" ? pageNumberPopular : pageNumberTopRated;
    }

    if (name === "popular") {
      pageNumberPopular = pageNumber;
    } else {
      pageNumberTopRated = pageNumber;
    }

    addPagination(name);
    let dataService = new DataService();
    let tvShows = null;
    document.getElementById(name).innerHTML = "Loadding....";
    tvShows = (await dataService.getTVShows(name, pageNumber)).results;
    document.getElementById(name).innerHTML = "";
    for (let property in tvShows) {
      document.getElementById(name).innerHTML += this.showItem(
        tvShows[property]
      );
      document
        .getElementById(tvShows[property].id)
        .setAttribute("onclick", `displayModal(${tvShows[property].id})`);
    }
  }

  showItem(param) {
    let html = `<div id="${param.id}"; class="item"; >`;
    html += `<div id="${param.id}"; class="title">${param.original_name}</div>`;
    html += param.backdrop_path
      ? `<img src="https://image.tmdb.org/t/p/w500${
          param.backdrop_path
        }"></div>`
      : `</div>`;

    return html;
  }

  async displayModal(id) {
    let dataService = new DataService();
    let detail = await dataService.getTVShowDetail(id);
    let modal = document.getElementById("myModal");
    let closeBtn = document.getElementsByClassName("close")[0];
    let html = "Loading....";
    document.getElementById("modal-content").innerHTML = html;

    modal.style.display = "block";
    closeBtn.onclick = function() {
      modal.style.display = "none";
    };

    window.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };

    html = `<p>${detail.original_name}</p>`;
    html += `<p>${detail.overview}</p>`;
    html += detail.backdrop_path
      ? `<img src="https://image.tmdb.org/t/p/w500${detail.backdrop_path}">`
      : ``;
    html += `<p>Number of seasons: ${detail.number_of_seasons}</p>`;
    html += `<p>Number of episodes: ${detail.number_of_episodes}</p>`;
    document.getElementById("modal-content").innerHTML = html;
    for (let property in detail.seasons) {
      let season = detail.seasons[property];
      html = "========================================================</br>";
      html += `<div id="${season.id}"><p>${season.name}. Episode count: ${
        season.episode_count
      }</p></div>`;
      document.getElementById("modal-content").innerHTML += html;
      document
        .getElementById(season.id)
        .setAttribute(
          "onclick",
          `displaySeason([${id}, ${+property + 1}, ${season.id}])`
        );
    }
  }

  async displaySeason(params) {
    let dataService = new DataService();
    let seasonDetail = await dataService.getSeasonDetail(params[0], params[1]);
    let html = "Loading....";
    document.getElementById(params[2]).innerHTML = html;
    html = `<p>${seasonDetail.name}</p>`;
    html += seasonDetail.overview ? `<p>${seasonDetail.overview}</p>` : ``;
    html += seasonDetail.poster_path
      ? `<img src="https://image.tmdb.org/t/p/w500${seasonDetail.poster_path}">`
      : ``;
    html += `<p>Season number: ${params[1]}</p>`;
    html += `<p>Number of episodes: ${seasonDetail.episodes.length}</p>`;
    document.getElementById(params[2]).innerHTML = html;

    for (let property in seasonDetail.episodes) {
      let episode = seasonDetail.episodes[property];
      html = `<div id="${episode.id}"><p>${episode.name}.</br>`;
      html +=
        "-------------------------------------------------------------</p></div>";
      document.getElementById(params[2]).innerHTML += html;
      document
        .getElementById(episode.id)
        .setAttribute(
          "onclick",
          `displayEpisode([${params[0]}, ${params[1]}, ${+property + 1}, ${
            episode.id
          }])`
        );
    }
  }

  async displayEpisode(params) {
    let dataService = new DataService();
    let episodeDetail = await dataService.getEpisodeDetail(
      params[0],
      params[1],
      params[2]
    );
    let html = "Loading....";
    document.getElementById(params[3]).innerHTML = html;
    console.log(episodeDetail);
    html = `<p>${episodeDetail.name}</p>`;
    html += episodeDetail.overview ? `<p>${episodeDetail.overview}</p>` : ``;
    html += episodeDetail.still_path
      ? `<img src="https://image.tmdb.org/t/p/w500${episodeDetail.still_path}">`
      : ``;
    html += `<p>Season number: ${params[1]}</p>`;
    html += `<p>Episode number: ${params[2]}</p>`;
    document.getElementById(params[3]).innerHTML = html;
  }
}

let showService = new ShowService();
window.displayModal = async id => {
  showService.displayModal(id);
};

window.displaySeason = async params => {
  showService.displaySeason(params);
};

window.displayEpisode = async params => {
  showService.displayEpisode(params);
};

window.displayPage = async name => {
  showService.displayPage(name);
};

async function main() {
  showService.displayPage("popular", 1);
  showService.displayPage("top_rated", 1);
}

main();

async function addPagination(pageName) {
  let pageNumber =
    pageName === "popular" ? pageNumberPopular : pageNumberTopRated;
  let html = `<div> Page number: ` + pageNumber;
  html +=
    ` Go to page <input id="${pageName + 2}" type="text" size="3" value="` +
    pageNumber +
    `"/>`;
  html += ` <button onclick="displayPage('${pageName}')">Go</button>`;
  html += `</div>`;
  document.getElementById(pageName + 1).innerHTML = html;
}
