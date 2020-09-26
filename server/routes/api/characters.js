const express = require('express');
const mongoose = require('mongoose');
const { getDbUri, getOpts } = require('./database.js');
const characterSchema = require('../../schemas/characterSchema.js');
const Character = mongoose.model("Character", characterSchema);

const router = express.Router();

// Get Chars
router.get('/', async (req, res) => {
    let characters;

    connect()

    await Character.find({...req.body}, (err, charArr) => {
        if (err) throw err;
        else characters = charArr;
    });

    res.send(characters);
});

// Add Char
router.post('/', async (req, res) => {
    connect();
    
    try {
        let character = new Character({...req.body});

        await character.save();
        res.status(201).send();
    } catch (err) {
        res.status(400).send("Error! Name is required!");
    }
});

// Update Char
router.put('/:id', async (req, res) => {
    connect();
    if (req.body.name === '') res.status(400).send("Cannot set empty name");
    else await Character.findByIdAndUpdate(req.params.id, {...req.body}, err => {
        if (err) res.status(500).send();
        else res.status(201).send();
    });
});

// Delete Char
router.delete('/:id', async (req, res) => {
    connect();
    await Character.findByIdAndDelete(req.params.id, err => {
        
    });
    res.status(200).send();
});

function connect() {
    mongoose.connect(getDbUri(), getOpts(), err => {
        if (err) throw err;
    });
}

module.exports = router;