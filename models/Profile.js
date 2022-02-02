const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false,
        default: null
    },
    fullName: {
        type: mongoose.SchemaTypes.String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    genderId: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    interestedInGender: {
        type: mongoose.SchemaTypes.Number
    },
    location: {
        type: [Number],
        required: true
    },
    photos: {
        type: [mongoose.SchemaTypes.String]
    },
    bio: {
        type: mongoose.SchemaTypes.String
    },
    address: {
        type: mongoose.SchemaTypes.String
    },
    work: {
        type: mongoose.SchemaTypes.String
    }

})

module.exports = Profile = mongoose.model('Profile', ProfileSchema);