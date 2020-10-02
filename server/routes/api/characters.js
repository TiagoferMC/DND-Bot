import { Router } from "express";
import { model, connect as _connect } from "mongoose";
import { dbUri, dbOpts } from "./database.js";
import characterSchema from "../../schemas/characterSchema.js";
const Character = model("Character", characterSchema);

const router = Router();

// Get Characters
router.get("/", async (req, res) => {
    let characters;

    if ((await connect(res)) === 500) return;

    await Character.find({ ...req.body }, (err, charArr) => {
        if (err) res.status(500).send("Internal Server Error Finding...");
        else characters = charArr;
    });

    res.send(characters);
});

// Add Character
router.post("/", async (req, res) => {
    if ((await connect(res)) === 500) return;

    try {
        let character = new Character({ ...req.body });

        await character.save((err) => {
            if (err) res.status(500).send("Internal Server Error...");
            else res.status(201).send();
        });
    } catch (err) {
        res.status(400).send("Error! Character Name is required!");
        return;
    }
});

// Update Character
router.put("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    if (req.body.name === "")
        res.status(400).send("Cannot set empty character name");
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

// Delete Character
router.delete("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    await Character.findByIdAndDelete(req.params.id, (err) => {
        if (err) res.status(500).send("Internal Server Error...");
        else res.status(200).send();
    });
});

async function connect(res) {
    return await _connect(dbUri, dbOpts, (err) => {
        if (err) {
            res.status(500).send("Internal Server Error...");
            return 500;
        }
        return 200;
    });
}

export default router;
