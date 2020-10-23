'use strict';

// Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response } = require('express');

// Environment Variables
require('dotenv').config();

// Declare Port
const PORT = process.env.PORT || 3000;

// Express Start/Insantiate
const app = express();

// CORS (Cross Origin Resource Sharing)
app.use(cors());

function errorHandling(request, response) {
  response.status(500).send('Broken!');
}

function notFoundHandler(request, response) {
  response.status(404).send('Oops! Handler not found. Try again!');
}

// Routes
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler)


// Geographic Location Handler
function locationHandler(request, response) {
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  // console.log(URL);
  superagent.get(URL)
    .then(data => {
      let location = new Location(data.body[0], city);
      response.status(200).json(location);
    })
    .catch((error) => {
      response.status(500).send('Mother does not play that!');
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
    console.log(data.body.data[0]);
  })
  .catch((error) => {
    response.status(500).send('Mother does not play that!');
    console.log(error);
  });
  // console.log(URL);
  // console.log('LATITUDE', lat);
  // console.log('LONGITUDE', lon);
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server port ${PORT} is ALIVE!!! MWAHAHAHA!!!!`);
});
