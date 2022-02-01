const User = require("../models/User");
const Profile = require("../models/Profile");
const connectDB = require('../config/mongodb');
connectDB();
async function print(){
    const profiles = await Profile.find().select('userId')
    console.log(profiles)
}

print()