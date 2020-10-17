'use strict';

// Dependencies
const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Declare Port
const PORT = process.env.PORT || 3000;

// Express Start/Insantiate
const app = express();

// CORS (Cross Origin Resource Sharing)
app.use(cors());

function errorHandling(error, request, response) {
  response.status(500).send(error);
}

// Routes
app.get('/', (request, response) =>{
  response.send('Hello World');
 })

app.get('/location', (request, response) => {
  try {
let city = request.query.city;
let locationData = require('./data/location.json')[0];
let location = new Location (locationData, city);
response.send(location);
console.log('CITY', city);
  }
  catch(error){
    errorHandling('Mother does not play that!', request, response);
  }
});

function Location(obj, query){
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = query;
  this.formatted_query = obj.display_name;
}

app.get('/weather', (request, response) => {
  try {
  let data = require('./data/weather.json');
  let weatherArray = [];
  data.data.forEach(val => {
    weatherArray.push(new Weather(val));
  });
  response.send(weatherArray);
}
catch(error){
  errorHandling('Mother does not play that!', request, response);
}
})

function Weather (obj){
  this.forecast = obj.weather.description;
  this.time = new Date(obj.valid_date).toDateString();
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});




