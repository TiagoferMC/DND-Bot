const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, 'Created date is required']
    }
})

Character = mongoose.model("Character", characterSchema);
module.exports = Character;
