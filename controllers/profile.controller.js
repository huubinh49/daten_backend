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
            const user = await User.findById(req.user.id);
            if(!user)
                return next(createErrors[401]("This user isn't exist"))
            
            let profile = await Profile.findOne({
                userId: user._id.toString()
            })
            if(profile){
                return next(createErrors[409]("There is an existing profile")) 
            }
            const {
                name,
                dob,
                gender,
                interested,
                position
            } = req.body;
            if(!name || !dob || !gender || !interested || !position){
                return next(createErrors[400]("Bad request"))
            }
            const location =  position.split(",")
            const fileUploads = req.files.map((file, i) =>(uploadToCloudinary('user', file)))
            const fileResults = await Promise.all(fileUploads);
            
            profile = await Profile.create({ 
                userId: user._id, 
                fullName: name,
                dateOfBirth: dob,
                genderId: gender,
                interestedInGender: interested,
                photos: fileResults.map((image) => image.url),
                location: [parseFloat(location[0]), parseFloat(location[1])]
            });
            const result = await User.updateOne(
                {"_id": user._id},{
                    "profile": profile._id
                }
            )
            res.status(201).send({'profile': profile})
        }
        
    } catch (error) {
        console.log(error)
        return next(createErrors[404]("An error occurs"))
    }
}
async function getProfile(req, res, next) {
    try {
        const user_id = req.query.user_id;
        const profile = await Profile.findOne({
            userId: user_id
        })
        res.status(200).send({'profile': profile})
    } catch (error) {
        return next(createErrors[404]("An error occurs"))
    }
}
//TODO: Modified updateProfile
// - check images is preserved or not
// - update biography
async function updateProfile(req, res, next) {
    try {   
        const user = await User.findById(req.user.id);
        if(!user)
            return next(createErrors[401]("This user isn't exist"))
        const {
            work,
            bio,
            address,
            gender,
            interested
        } = req.body;
        console.log(work,
            bio,
            address,
            gender,
            interested)
        let profile = await Profile.findOne(
        {
            "_id": user.profile
        });
        profile.bio = bio || profile.bio
        profile.address = address || profile.address
        profile.work = work || profile.work
        profile.genderId = gender || profile.genderId
        profile.interestedInGender = interested || profile.interestedInGender
        console.log('Modified: ', profile)
        if (req.files.length) {
            const fileUploads = req.files.map((file, i) =>(uploadToCloudinary('user', file)))
            const fileResults = await Promise.all(fileUploads); 
            for(let idx in req.files){
                mongoIdx = req.files[idx].fieldname.split('-')[1];
                if(mongoIdx < profile.photos.length){
                    profile.photos[mongoIdx] = fileResults[idx].url;
                }else{
                    profile.photos.push(fileResults[idx].url)
                }
            }
            profile.photos = fileResults.map((image) => image.url)
            await profile.save().catch(err => {console.log(err)})
            res.status(200).send({'profile': profile})
        }else{
            await profile.save()
            res.status(200).send({'profile': profile})
        }
    } catch (error) {
        console.log(error)
        return next(createErrors[404]("An error occurs"))
    }
}
module.exports = {
    createProfile,
    getProfile,
    updateProfile

}