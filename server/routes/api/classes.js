import { Router } from "express";
import { connect as _connect } from "mongoose";
import { dbUri, dbOpts } from "./database.js";
import Class from "../../models/classModel.js";

const router = Router();

// Get Classes
router.get("/", async (req, res) => {
    let classes;

    if ((await connect(res)) === 500) return;

    await Class.find({ ...req.body }, (err, classArr) => {
        if (err) res.status(500).send(err.message);
        else classes = classArr;
    });

    res.send(classes);
});

// Add Class
router.post("/", async (req, res) => {
    if ((await connect(res)) === 500) return;

    let classObj = new Class({ ...req.body });
    if (!classObj.name) {
        res.status(400).send("Error! Incorrectly formatted Class!");
        return;
    }

    Class.findOne({ name: classObj.name }, (err, dbClass) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        if (dbClass) {
            res.status(400).send(
                `There already exists a class called ${classObj.name}. Class names must be unique`
            );

            return;
        }

        classObj.save((err) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).send(classObj);
        });
    });
});

// Update Class
router.put("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    if ("name" in req.body) {
        let hasErrored = false;

        if (!req.body.name) {
            res.status(400).send("Cannot set empty class name");
            return;
        } else {
            await Class.findOne({ name: req.body.name }, (err, classArr) => {
                if (err) {
                    res.status(500).send(err.message);
                    hasErrored = true;
                    return;
                }

                if (classArr) {
                    if (classArr._id == req.params.id) return;
                    else {
                        res.status(400).send(
                            `There already exists a class named ${req.body.name}`
                        );
                        hasErrored = true;
                        return;
                    }
                }
            });
        }

        if (hasErrored) return;
    }

    if ("classes" in req.body) {
        return;
    }

    await Class.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true },
        (err, dbChar) => {
            if (err) res.status(500).send(err.message);
            else res.status(201).send(dbChar);
        }
    );
});

// Delete Class
router.delete("/:id", async (req, res) => {
    if ((await connect(res)) === 500) return;

    await Class.findByIdAndDelete(req.params.id, (err) => {
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

// // Add Ability to Class
// async function addAbility(classObj, classLvl, abilityId) {
//     classObj.abilities[classLvl].push(abilityId);
//     await classObj.save();
// }

// // Delete Ability from Class
// async function deleteAbility(classObj, classLvl, abilityId) {
//     classObj.abilities[classLvl] = classObj.abilities[classLvl].filter(
//         (ability) => {
//             ability._id != abilityId;
//         }
//     );
//     await classObj.save();
// }

export default router;
