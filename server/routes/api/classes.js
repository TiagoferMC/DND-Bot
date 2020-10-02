import { Router } from "express";
import { model, connect as _connect } from "mongoose";
import { dbUri, dbOpts } from "./database.js";
import classSchema from "../../schemas/classSchema.js";
const Class = model("Class", classSchema);

const router = Router();

// Get Classes
router.get("/", async (req, res) => {
    let classes;

    if ((await connect(res)) === 500) return;

    await Class.find({ ...req.body }, (err, classArr) => {
        if (err) res.status(500).send("Internal Server Error Finding...");
        else classes = classArr;
    });

    res.send(classes);
});

// Add Class
router.post("/", async (req, res) => {
    if ((await connect(res)) === 500) return;

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
    if ((await connect(res)) === 500) return;

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
    if ((await connect(res)) === 500) return;

    await Class.findByIdAndDelete(req.params.id, (err) => {
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
