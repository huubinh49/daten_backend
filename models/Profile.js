const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12

const PointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
});

  
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
        type: PointSchema
    },
    photos: {
        type: [mongoose.SchemaTypes.String]
    }
})

module.exports = Profile = mongoose.model('Profile', ProfileSchema);