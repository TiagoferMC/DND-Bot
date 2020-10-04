import { Schema, model } from "mongoose";

const abilitySchema = new Schema({
    name: {
        type: String,
        default: "Knowledge",
        required: [true, "Ability name is required"]
    },
    description: {
        type: String,
        default: "You are Smart",
        required: [true, "Ability Description is required"]
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, "Created date is required"]
    }
});

const Ability = model("Ability", abilitySchema);

export default Ability;
