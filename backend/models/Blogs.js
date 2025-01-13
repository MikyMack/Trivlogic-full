const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true 
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now 
    },
    authorName: {
        type: String,
        required: true,
        trim: true
    },
    industry: {
        type: String,
        required: false, 
        trim: true
    },
    listed: {
        type: Boolean,
        default: true
    }
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
