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
app.get('/', (request, response) =>{
  response.send('Hello World');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});




