const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieModel = require('./movie-model.js');

const app = express();

app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'files')));

app.get('/genres', function(req, res) {
  const movies = Object.values(movieModel);
  const genresSet = new Set();
  
  movies.forEach(movie => {
    movie.Genres.forEach(genre => genresSet.add(genre));
  });
  
  res.json(Array.from(genresSet).sort());
});

app.get('/movies', function (req, res) {
  let movies = Object.values(movieModel);
  const genreQuery = req.query.genre;

  if (genreQuery && genreQuery !== 'All') {
    movies = movies.filter(movie => movie.Genres.includes(genreQuery));
  }
  
  res.send(movies);
});

app.get('/movies/:imdbID', function (req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;
 
  if (exists) {
    res.send(movieModel[id]);
  } else {
    res.sendStatus(404);    
  }
});

app.put('/movies/:imdbID', function(req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  movieModel[id] = req.body;
  
  if (!exists) {
    res.status(201).send(req.body);
  } else {
    res.sendStatus(200);
  }
});

app.listen(3000);
console.log("Server now listening on http://localhost:3000/");