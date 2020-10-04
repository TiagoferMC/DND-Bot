import { Schema, model } from "mongoose";

const classSchema = new Schema({
    name: {
        type: String,
        required: [true, "Class name is required"]
    },
    // Abilities Array, each index represents a level
    abilities: {
        type: [[{ type: Schema.Types.ObjectId, ref: "Ability" }]],
        required: [false, "Abilities are not Required"]
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, "Created date is required"]
    }
});

const Class = model("Class", classSchema);

export default Class;
