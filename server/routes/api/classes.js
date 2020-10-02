const express = require("express");
const mongoose = require("mongoose");
const { getDbUri, getOpts } = require("./database.js");
const classSchema = require("../../schemas/classSchema.js").default;
const Class = mongoose.model("Class", classSchema);

const router = express.Router();

// Get Classes
router.get("/", async (req, res) => {
    let classes;

    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    await Class.find({ ...req.body }, (err, classArr) => {
        if (err) res.status(500).send("Internal Server Error...");
        else classes = classArr;
    });

    res.send(classes);
});

// Add Class
router.post("/", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    try {
        let classObj = new Class({ ...req.body });

        await classObj.save((err) => {
            if (err) res.status(500).send("Internal Server Error...");
            else res.status(201).send();
        });
    } catch (err) {
        res.status(400).send("Error! Class Name is required!");
        return;
    }
});

// Update Class
router.put("/:id", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    if (req.body.name === "")
        res.status(400).send("Cannot set empty class name");
    else
        await Class.findByIdAndUpdate(req.params.id, { ...req.body }, (err) => {
            if (err) res.status(500).send("Internal Server Error...");
            else res.status(201).send();
        });
});

// Delete Class
router.delete("/:id", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    await Class.findByIdAndDelete(req.params.id, (err) => {
        if (err) res.status(500).send("Internal Server Error...");
        else res.status(200).send();
    });
});

function connect() {
    mongoose.connect(getDbUri(), getOpts(), (err) => {
        if (err) return 500;
        else return 200;
    });
}

module.exports = router;
