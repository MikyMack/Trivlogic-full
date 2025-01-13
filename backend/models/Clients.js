const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    listed: {
        type: Boolean,
        default: true, 
    },
});

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
