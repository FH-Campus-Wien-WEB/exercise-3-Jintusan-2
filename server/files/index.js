import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
          .append(new ElementBuilder("img").with("src", movie.Poster))
          .append(new ElementBuilder("h1").text(movie.Title))
          .append(new ElementBuilder("p")
              .append(new ElementBuilder("button").text("Edit")
                    .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
          .append(new ParagraphBuilder().items(
              "Runtime " + formatRuntime(movie.Runtime),
              "\u2022",
              "Released on " +
                new Date(movie.Released).toLocaleDateString("en-US")))
          .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
          .append(new ElementBuilder("p").text(movie.Plot))
          .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
          .append(new ListBuilder().items(movie.Directors))
          .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
          .append(new ListBuilder().items(movie.Writers))
          .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
          .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove();
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText);
      for (const movie of movies) {
        appendMovie(movie, mainElement);
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };

  const url = new URL("/movies", location.href);
  
  if (genre && genre !== "All") {
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url);
  xhr.send();
}

function setupGenresAccordion() {
  const trigger = document.querySelector('.collapse-trigger');
  const genresSection = document.querySelector('.genres-section');

  if (trigger && genresSection) {
    trigger.addEventListener('click', () => {
      genresSection.classList.toggle('open');
      genresSection.classList.toggle('collapsed');
    });
  }
}

window.onload = function () {
  setupGenresAccordion();

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.getElementById("genre-list");

    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);

      const allLi = document.createElement("li");
      const allBtn = document.createElement("button");
      allBtn.textContent = "All";
      allBtn.onclick = () => loadMovies("All");
      allLi.appendChild(allBtn);
      listElement.appendChild(allLi);

      for (const genre of genres) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = genre;
        btn.onclick = () => loadMovies(genre);
        li.appendChild(btn);
        listElement.appendChild(li);
      }

      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};