import { Schema, model } from "mongoose";

const characterSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    race: {
        type: String,
        default: "Human",
        required: [true, "Race is required"]
    },
    classes: {
        type: [
            {
                level: {
                    type: Number,
                    default: 1,
                    required: [true, "Level is required"]
                },
                class: {
                    type: { type: Schema.Types.ObjectId, ref: "Class" },
                    required: [false, "Class is not required"]
                }
            }
        ],
        required: [true, "Race is required"]
    },
    background: {
        type: String,
        default: "Acolyte",
        required: [true, "Background is required"]
    },
    experience: {
        type: Number,
        required: [false, "Experience is optional"]
    },
    alignment: {
        type: String,
        required: [false, "Alignment is optional"]
    },
    playerName: {
        type: String,
        required: [false, "Player name is optional"]
    },
    hp: {
        type: Number,
        default: 10,
        required: [true, "HP is required"]
    },
    ac: {
        type: Number,
        default: 10,
        required: [true, "AC is required"]
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, "Created date is required"]
    }
});

const Character = model("Character", characterSchema);

export default Character;
