const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const CharacterService = require('./routes/api/characters/characters.js')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const characters = require('./routes/api/characters/characters');
app.use('/api/characters', characters);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

