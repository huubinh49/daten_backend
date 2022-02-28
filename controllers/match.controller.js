const createErrors = require("http-errors");
const Match = require("../models/Match");
const Profile = require("../models/Profile");
const Room = require("../models/Room");
const socket = require("../socket")
const createMatch = async (userIdA, userIdB) => {    
    let match = await Match.findOne({
        "users": { "$all": [userIdA, userIdB]},
    })
    if(match){
        throw Error('They are already matched');
    }
    match = await Match.create({
        users: [userIdA, userIdB]
    })
    const profileUserA = await Profile.findOne({
        userId: userIdA
    })
    const profileUserB = await Profile.findOne({
        userId: userIdB
    })
    socket.sendTo(userIdA, 'newMatch', profileUserB)
    socket.sendTo(userIdB, 'newMatch', profileUserA)
    return match
}
const getMatch =  async (req, res, next) => {
    try {
        const user_id = req.user.id
        const {
            target_id
        } = req.query;
        let match = await Match.findOne({
            "users": { "$all": [user_id, target_id]},
        })
        if(!match){
            return next(createErrors[400]("They are not matched"))
        }
        res.status(200).send({'match': match})
    }catch(error){
        return next(createErrors[404]("An error occurs"))
    }
}
const getPartners = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        // Get matches that have user_id in users
        let matches = Match.find({
            "users": { "$in": [user_id]},
        })
        const partner_ids = []
        for await (const doc of matches.cursor()){
            const partner_id = (doc.users[0].toString() == user_id)? doc.users[1].toString(): doc.users[0].toString();
            partner_ids.push(partner_id);
        }
        console.log(partner_ids)
        const results = await Profile.find({
            userId: {
                '$in': partner_ids
            }
        }, {
            '_id': 1,
            'photos': 1,
            'fullName': 1,
            'userId': 1
        })
        res.status(200).send({'matches': results})
    } catch (error) {
        console.log('Error at matches: ', error)
        return next(createErrors[404]("An error occurs"))
    }
}

const getChattedPartners = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        // Get matches that have user_id in users & have at least 1 message
        let matches = Match.find({
            "users": { "$in": [user_id]},
            "newestMessage":{'$ne': null}
        })
        const partner_ids = []
        const newestMessageDict = {}
        // Get a list of chatted partners
        for await (const doc of matches.cursor()){
            const partner_id = (doc.users[0].toString() == user_id)? doc.users[1].toString(): doc.users[0].toString();
            partner_ids.push(partner_id);
            newestMessageDict[partner_id] = doc.newestMessage
        }
        // Find partner profile
        let messages = await Profile.find({
            'userId': {
                '$in': partner_ids
            }
        }, {
            'userId': 1,
            'photos': 1,
            'fullName': 1,
            'userId': 1
        })
        messages = messages.map(profile => ({
            'userId': profile.userId,
            'photos': profile.photos,
            'fullName': profile.fullName,
            'newestMessage': newestMessageDict[profile.userId].messageBody,
            'senderId': newestMessageDict[profile.userId].senderId,
        }))
        res.status(200).send({'messages': messages})
    } catch (error) {
        console.log('Error at matches: ', error)
        return next(createErrors[404]("An error occurs"))
    }
}

const getPrivatelyChattedPartners = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        // Get matches that have user_id in users & have at least 1 message
        let rooms = Room.find({
            "users": { "$in": [user_id]},
            "newestMessage":{'$ne': null}
        })
        const partner_ids = []
        const newestMessageDict = {}
        // Get a list of chatted partners
        for await (const doc of rooms.cursor()){
            const partner_id = (doc.users[0].toString() == user_id)? doc.users[1].toString(): doc.users[0].toString();
            partner_ids.push(partner_id);
            newestMessageDict[partner_id] = doc.newestMessage
        }
        // Find partner profile
        let messages = await Profile.find({
            'userId': {
                '$in': partner_ids
            }
        }, {
            'userId': 1,
            'fullName': 1,
            'userId': 1
        })
        messages = messages.map(profile => ({
            'userId': profile.userId,
            'fullName': profile.fullName,
            'newestMessage': newestMessageDict[profile.userId].messageBody,
            'senderId': newestMessageDict[profile.userId].senderId,
        }))
        res.status(200).send({'messages': messages})
    } catch (error) {
        console.log('Error at rooms: ', error)
        return next(createErrors[404]("An error occurs"))
    }
}
module.exports = {
    createMatch,
    getPartners,
    getChattedPartners,
    getPrivatelyChattedPartners,
    getMatch
}