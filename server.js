'use strict';

// Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');

// Environment Variables
require('dotenv').config();

// Declare Port
const PORT = process.env.PORT || 3000;

// create postgres client
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Express Start/Insantiate
const app = express();

// CORS (Cross Origin Resource Sharing)
app.use(cors());

function errorHandling(request, response) {
  response.status(500).send('Broken!¯\_(ツ)_/¯');
  console.log(errorHandling);
}

function notFoundHandler(request, response) {
  response.status(404).send('NOT TODAY SATAN!.........This is a 404 Error by the way.');
  console.log(notFoundHandler);
}

// Routes
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.use('*', notFoundHandler);


// Geographic Location Handler
function locationHandler(request, response) {
  let city = request.query.city;
  console.log('city', city);
  // Calls in API Key from .env file
  let key = process.env.GEOCODE_API_KEY;
  // Check for previous cache of results
  const sqlQuery = `SELECT * FROM location WHERE search_query=$1`;
  let safeVal = [city];
  // console.log(client);
  client.query(sqlQuery, safeVal)
    .then(output => {
      // console.log('output', output);
      // Use previously cached data
      if (output.rowCount) {
        console.log('Data from Database');
        response.status(200).send(output.rows[0]);
      } else {
        // Call in new data from API Call (if no previous cache data exists)
        const URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

        superagent.get(URL)
          .then(data => {
            let location = new Location(data.body[0], city);
            const insertSql = `INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
            client.query(insertSql, [location.search_query, location.formatted_query, location.latitude, location.longitude])
              .then(results =>
                response.status(200).json(location));
                console.log('Ran API call for ', location);
          })
      }
    })
    .catch((error) => {
      response.status(500).send('It takes a lot of money to look this cheap! Location Handler is not working!(500)');
      console.log(error);
    });
}

// Weather Handler
function weatherHandler(request, response) {
  let key = process.env.WEATHER_API_KEY;
  let lon = request.query.longitude;
  let lat = request.query.latitude;
  const URL = `https://api.weatherbit.io/v2.0/forecast/daily/?key=${key}&lat=${lat}&lon=${lon}`;

  superagent.get(URL)
    .then(data => {
      let weather = data.body.data.map(val => {
        return new Weather(val);
      });
      weather = weather.slice(0, 8);
      response.status(200).send(weather);
      // console.log(weather);
      // console.log(data.body.data[0]);
    })
    .catch((error) => {
      response.status(500).send('No T, no shade, no pink lemonade! Weather Handler is not working!(500)');
      console.log(error);
    });
  // console.log(URL);
  // console.log('LATITUDE', lat);
  // console.log('LONGITUDE', lon);
}

// Trails Handler
function trailsHandler(request, response) {
  // console.log('Not today shady lady!')
  let key = process.env.TRAIL_API_KEY;
  let lon = request.query.longitude;
  let lat = request.query.latitude;

  const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;

  superagent.get(URL)
    .then(data => {
      let trail = data.body.trails.map(val => {
        return new Trails(val);
      });
      response.status(200).send(trail);
    })
    .catch((error) => {
      response.status(500).send('Awww shoes, looks like the Tail Handler is not working!(500)');
      console.log(error);
    });
}


// Movies Handler
function moviesHandler(request, response) {
  console.log('Miss Vanjie…. Miss… Vaaaaanjie… Miss Vaaaaaaaaaaaaanjiiiiiiie.');
  let key = process.env.MOVIE_API_KEY;
  let city = request.query.search_query;
  // console.log(key);

  const URL = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${city}&page=1&include_adult=false`;

  // const URL = `https://api.themoviedb.org/3/search/movie?api_key=f90535b0bf0f64bd249c22304a5427f3&language=en-US&query=seattle&page=1&include_adult=false`;

  // console.log('Data moviesHandler', obj.data.body);

  superagent.get(URL)
    // console.log('Movies URL', URL);
    .then(data => {
      // console.log('Movies Data', data)
      let movie = data.body.results.map(val => {
        return new Movies(val);
      });
      response.status(200).send(movie);
    })
    .catch((error) => {
      response.status(500).send('Impersonating Beyoncè is not your destiny, child!(500)');
      console.log(error);
    });
}

// Location Constructor
function Location(obj, query) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = query;
  this.formatted_query = obj.display_name;
}

// Weather Constructor
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.valid_date).toDateString();
}

// Trail Constructor
function Trails(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(11, 20);
}

// Movies Constructor
function Movies(obj) {
this.title = obj.original_title;
this.overview = obj.overview;
this.average_votes = obj.vote_average;
this.total_votes = obj.vote_count;
this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
this.popularity = obj.popularity;
this.release_date = obj.release_date;
}

// Database Connection
client.connect()
.then(() => {
  // Start Server
  app.listen(PORT, () => {
    console.log(`Server port ${PORT} is ALIVE!!! MWAHAHAHA!!!!`);
  });
})
.catch(error => console.error(error));

