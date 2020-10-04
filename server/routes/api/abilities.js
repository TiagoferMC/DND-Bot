import { Router } from "express";
import { connect as _connect } from "mongoose";
import { dbUri, dbOpts } from "./database.js";
import Ability from "../../models/abilityModel.js";

const router = Router();

// Get Abilities
router.get("/", async (req, res) => {
    let abilities;

    if ((await connect(res)) === 500) return;

    await Ability.find({ ...req.body }, (err, abilityArr) => {
        if (err) res.status(500).send(err.message);
        else abilities = abilityArr;
    });

    res.send(abilities);
});

// Add Ability
router.post("/", async (req, res) => {
    if ((await connect(res)) === 500) return;

    let abilityObj = new Ability({ ...req.body });
    if (!abilityObj.name) {
        res.status(400).send("Error! Incorrectly formatted Ability!");
        return;
    }

    Ability.findOne({ name: abilityObj.name }, (err, dbAbility) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        if (dbAbility) {
            res.status(400).send(
                `There already exists a ability called ${abilityObj.name}. Ability names must be unique`
            );

            return;
        }

        abilityObj.save((err) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).send(abilityObj);
        });
    });
});

// Update Ability
router.put("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    if ("name" in req.body) {
        let hasErrored = false;

        if (!req.body.name) {
            res.status(400).send("Cannot set empty ability name");
            return;
        } else {
            await Ability.findOne(
                { name: req.body.name },
                (err, abilityArr) => {
                    if (err) {
                        res.status(500).send(err.message);
                        hasErrored = true;
                        return;
                    }

                    if (abilityArr) {
                        if (abilityArr._id == req.params.id) return;
                        else {
                            res.status(400).send(
                                `There already exists a ability named ${req.body.name}`
                            );
                            hasErrored = true;
                            return;
                        }
                    }
                }
            );
        }

        if (hasErrored) return;
    }

    await Ability.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true },
        (err, dbChar) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).send(dbChar);
        }
    );
});

// Delete Ability
router.delete("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    await Ability.findByIdAndDelete(req.params.id, (err) => {
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

export default router;
