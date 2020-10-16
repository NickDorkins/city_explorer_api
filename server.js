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

// Routes
app.get('/location', (request, response) => {
let city = request.query.city;
let locationData = require('./data/location.json')[0];
let location = new Location (locationData, city);
response.send(location);
console.log('CITY', city);
});

function Location(obj, query){
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = query;
  this.formatted_query = obj.display_name;
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});




