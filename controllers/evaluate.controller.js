const createErrors = require("http-errors");
const Evaluation = require("../models/Evaluation");
const Profile = require("../models/Profile");
const bloom_filter = require('../config/bloom_filter');
const redis = require("../config/redis");
const { createMatch } = require("./match.controller");

const getEvaluatingProfile = async (req, res, next) => {
    try{
        const profile = await Profile.findOne({
            'userId': req.user.id
        })
        if(!profile)
        return next(createErrors[401]("The profile of this user isn't exist"))

        // get profile that isn't exist in bloom_filter & in acceptable radius
        const profiles = await Profile.find({
            location:  {
                "$geoWithin": {
                  $centerSphere: [
                    [
                        profile.location[0], // longitude
                        profile.location[1] // latitude
                    ],
                    req.query.distance/6378.1
                  ]
                }
              },
            userId :{
                "$ne": req.user.id
            }
        })
        const results = []
        let profile_count = 0
        const per_page = parseFloat(req.query.per_page);
        for (const doc of profiles) {
            const hash_str = `${req.user.id}_${doc.userId}`;
            if(profile_count >= per_page){
                break;
            }
            if(!bloom_filter.test(hash_str)){
                results.push(doc);
                
                profile_count += 1;
            }
        }
        res.status(200).send({'count': profile_count ,'profiles': results})
    }catch(error){
        console.log('Error at evaluate: ', error)
        return next(createErrors[404]("An error occurs"))
    }
}
// TODO: check error when matching & realtime notification by socket
const evaluateProfile = async (req, res, next) => {
    try {
        console.log('evaluating: ', req.body)
        const {
            target_id,
            is_liked
        } = req.body;
        const user_id = req.user.id;
        try{
            if(is_liked){
                const alsoLiked = await redis.get(`${target_id}_${user_id}`);
                console.log('alsoLiked: ', alsoLiked)
                if(alsoLiked){
                    console.log('creating match')
                    await createMatch(user_id, target_id)
                    console.log('done match')
                    await redis.del(`${target_id}_${user_id}`);
                    res.status(200).send({
                        'matched': true
                    })
                }else{
                    await redis.set(`${user_id}_${target_id}`, true);
                }
            }
            
            bloom_filter.add(`${user_id}_${target_id}`);
            res.status(200).send({
                'matched': false
            })
        }catch(error){
            console.log(error)
            return next(createErrors.InternalServerError())
        }

    } catch (error) {
        console.log('Error at evaluate: ', error)
        return next(createErrors[404]('An error occurs'))
    }
}
module.exports = {
    getEvaluatingProfile,
    evaluateProfile
}