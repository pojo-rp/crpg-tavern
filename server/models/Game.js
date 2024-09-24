const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const GameSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    releasedAt: {
        type: Date,
        required: true
    },
    tags: {
        type: Array
    }
});

module.exports = mongoose.model('Game', GameSchema);