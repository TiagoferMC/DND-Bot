const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Class name is required"]
    },
    level: {
        type: Number,
        default: 1,
        required: [true, "Level is required"]
    },
    created: {
        type: Date,
        default: Date.now(),
        required: [true, 'Created date is required']
    }
});

module.exports = classSchema;
