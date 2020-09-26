const express = require('express');
const mongoose = require('mongoose');
const { getDbUri, getOpts } = require('./database.js');
const classSchema = require('../../schemas/classSchema.js');
const Class = mongoose.model("Class", classSchema);

const router = express.Router();

// Get Classes
router.get('/', async (req, res) => {
    let classes;

    connect()

    await Class.find({ ...req.body }, (err, classArr) => {
        if (err) throw err;
        else classes = classArr;
    });

    res.send(classes);
});

// Add Class
router.post('/', async (req, res) => {
    connect();

    try {
        let classObj = new Class({ ...req.body });

        await classObj.save();
        res.status(201).send();
    } catch (err) {
        res.status(400).send("Error! Name is required!");
    }
});

// Update Class
router.put('/:id', async (req, res) => {
    connect();
    if (req.body.name === '') res.status(400).send("Cannot set empty name");
    else await Class.findByIdAndUpdate(req.params.id, { ...req.body }, err => {
        if (err) res.status(500).send();
        else res.status(201).send();
    });
});

// Delete Class
router.delete('/:id', async (req, res) => {
    connect();
    await Class.findByIdAndDelete(req.params.id, err => {

    });
    res.status(200).send();
});

function connect() {
    mongoose.connect(getDbUri(), getOpts(), err => {
        if (err) throw err;
    });
}

module.exports = router;