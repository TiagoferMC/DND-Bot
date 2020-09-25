const mongoose = require('mongoose');
const classSchema = require('../classes/classSchema.js');

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    nameLower: {
        type: String,
        required: [true, 'Lowercase Name is required']
    },
    race: {
        type: String,
        default: 'Human',
        required: [true, 'Race is required']
    },
    classes: {
        type: [classSchema],
        default: [{name: 'Fighter', nameLower: 'fighter'}],
        required: [true, 'A class is required']
    },
    background: {
        type: String,
        default: 'Acolyte',
        required: [true, 'Background is required']
    },
    experience: {
        type: Number,
        required: [false, 'Experience is optional']
    },
    alignement: {
        type: String,
        required: [false, 'Alignement is optional']
    },
    playerName: {
        type: String,
        required: [false, 'Player name is optional']
    },
    hp: {
        type: Number,
        default: 10,
        required: [true, 'HP is required']
    },
    ac: {
        type: Number,
        default: 10,
        required: [true, 'AC is required']
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, 'Created date is required']
    }
});

Character = mongoose.model("Character", characterSchema);
module.exports = Character;
