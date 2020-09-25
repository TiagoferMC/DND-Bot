const express = require('express');
const mongoose = require('mongoose');
const { getDBURI, getOpts } = require('../database.js');
const Character = require('./characterSchema.js');

const router = express.Router();

// Get Chars
router.get('/', async (req, res) => {
    let characters;

    connect()

    await Character.find({}, (err, charArr) => {
        if (err) throw err;
        else characters = charArr;
    });

    res.send(characters);
});

// Add Char
router.post('/', async (req, res) => {
    connect();
    
    try {
        let character = new Character({
            ...req.body,
            nameLower: req.body.name.toLowerCase()
        });

        await character.save();
        res.status(201).send();
    } catch (err) {
        res.status(400).send("Error! Name is required!");
    }
});

// Update Char
router.put('/:id', async (req, res) => {

});

// Delete Char
router.delete('/:id', async (req, res) => {
    connect();
    await Character.findByIdAndDelete(req.params.id, err => {
        
    });
    res.status(200).send();
});

function connect() {
    mongoose.connect(getDBURI(), getOpts(), err => {
        if (err) throw err;
        console.log("Connected to MongoDB - Characters!")
    });
}

module.exports = router;