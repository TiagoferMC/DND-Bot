const express = require("express");
const mongoose = require("mongoose");
const { getDbUri, getOpts } = require("./database.js");
const characterSchema = require("../../schemas/characterSchema.js").default;
const Character = mongoose.model("Character", characterSchema);

const router = express.Router();

// Get Chars
router.get("/", async (req, res) => {
    let characters;

    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    await Character.find({ ...req.body }, (err, charArr) => {
        if (err) res.status(500).send("Internal Server Error...");
        else characters = charArr;
    });

    res.send(characters);
});

// Add Char
router.post("/", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    try {
        let character = new Character({ ...req.body });

        await character.save((err) => {
            if (err) res.status(500).send("Internal Server Error...");
            else res.status(201).send();
        });
    } catch (err) {
        res.status(400).send("Error! Name is required!");
        return;
    }
});

// Update Char
router.put("/:id", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    if (req.body.name === "") res.status(400).send("Cannot set empty name");
    else
        await Character.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            (err) => {
                if (err) res.status(500).send("Internal Server Error...");
                else res.status(201).send();
            }
        );
});

// Delete Char
router.delete("/:id", async (req, res) => {
    if (connect() === 500) {
        res.status(500).send("Internal Server Error...");
        return;
    }

    await Character.findByIdAndDelete(req.params.id, (err) => {
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
