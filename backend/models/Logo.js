const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true 
    },
    title: {
        type: String,
        required: true,
        trim: true 
    },
    listed: {
        type: Boolean,
        default: true
    }
});

const Logo = mongoose.model('Logo', LogoSchema);

module.exports = Logo;
