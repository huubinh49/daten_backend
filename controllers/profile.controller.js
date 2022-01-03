// TODO: Create profile controller for the user
const createErrors = require("http-errors");
const User = require("../models/User");
const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary").v2;
const streamifier = require("streamifier");

function uploadToCloudinary(user_folder, file) {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream({
            folder: user_folder
        }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        }).end(file.buffer);
        streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
    });
}
   
async function createProfile(req, res, next) {
    try {     
        if (req.files) {
            const user = await User.findById(req.user._id);
            if(!user)
                return next(createErrors[401]("This user isn't exist"))
            
            let profile = await Profile.findOne({
                userId: user._id.toString()
            })
            if(profile){
                return next(createErrors[400]("There is an existing profile"))
            }
            const fileUploads = req.files.map((file, i) =>(uploadToCloudinary('user', file)))
            const fileResults = await Promise.all(fileUploads);
            profile = await Profile.create({ 
                userId: user._id, 
                fullName: req.body["name"],
                dateOfBirth: req.body["dob"],
                genderId: req.body["gender"],
                interestedInGender: req.body["interested"],
                photos: fileResults.map((image) => image.url),
                location: req.body["position"]
            });
            const result = await User.update(
                {"_id": user._id},{
                    "profile": profile._id
                }
            )
            res.send({status: "success", 'profile': profile})
        }
        
    } catch (error) {
        console.log(error)
        return next(createErrors[400]("An error occurs"))
    }
}
async function getProfile(req, res, next) {
    try {
        const user = await User.findById(req.user._id);
        res.send(user);
    } catch (error) {
        res.send("An error occured");
    }
}

module.exports = {
    createProfile,
    getProfile

}