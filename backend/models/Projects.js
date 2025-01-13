const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true 
    },
    date: {
        type: Date,
        required: true 
    },
    description: {
        type: String,
        required: true,
        trim: true 
    },
    liveLink: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([/\w \.-]*)*\/?$/.test(v);
            },
            message: 'Invalid URL format'
        }
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    listed: {
        type: Boolean,
        default: true 
    },
    image: {
        type: String,
        required: false
    }
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
