import { Router } from "express";
import { connect as _connect } from "mongoose";
import { dbUri, dbOpts } from "./database.js";
import Character from "../../models/characterModel.js";

const router = Router();

// Get Characters
router.get("/", async (req, res) => {
    let characters;

    if ((await connect(res)) === 500) return;

    await Character.find({ ...req.body }, (err, characterArr) => {
        if (err) res.status(500).send(err.message);
        else characters = characterArr;
    });

    res.send(characters);
});

// Add Character
router.post("/", async (req, res) => {
    if ((await connect(res)) === 500) return;

    let characterObj = new Character({ ...req.body });
    if (!characterObj.name) {
        res.status(400).send("Error! Incorrectly formatted Character!");
        return;
    }

    characterObj.save((err) => {
        if (err) res.status(500).send(err.message);
        else res.status(201).send(characterObj);
    });
});

// Update Character
router.put("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    if ("name" in req.body) {
        if (!req.body.name) {
            res.status(400).send("Cannot set empty character name");
            return;
        }
    }

    if ("classes" in req.body) {
        // Add Class
        // Remove Class
        // Change Class Parameters
    }

    await Character.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true },
        (err, dbChar) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).send(dbChar);
        }
    );
});

// Delete Character
router.delete("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    await Character.findByIdAndDelete(req.params.id, (err) => {
        if (err) res.status(500).send(err.message);
        else res.status(200).send();
    });
});

async function connect(res) {
    return await _connect(dbUri, dbOpts, (err) => {
        if (err) {
            res.status(500).send(err.message);
            return 500;
        }
        return 200;
    });
}

// Add Class to Character

// Remove Class from Character

export default router;
