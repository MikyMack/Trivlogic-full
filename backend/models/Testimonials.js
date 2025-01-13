const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true,
        trim: true
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

const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

module.exports = Testimonial;
