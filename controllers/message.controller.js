const createErrors = require("http-errors");
const { Message } = require('../models/Message');
const socket = require("../socket")


const getMessage = async (req, res, next) => {
    try{
        const {
            target_id,
            page, 
            per_page
        } = req.query;
        console.log("Received:", target_id,
            page, 
            per_page)
        const ids = [req.user.id, target_id]
        const messages = await Message.find({
            'senderId': {
                '$in': ids
            },
            'recipientId': {
                '$in': ids
            }
        }).sort({"createdAt": 1}) // 1 meaning ascending
        .limit(per_page) // Just retrieves 2 documents
        .skip(page*per_page); // like offset, skip the first 5 documents
        console.log("Already find: ", messages.length)
        res.status(200).send({
            'messages': messages
        })
    }catch(error){
        console.log(error)
        return next(createErrors[500]("An error occurs!"))
    }
}

const getPrivateMessages = async (req, res, next) => {
    try {
        const {
            room_id,
            page, 
            per_page
        } = req.query;
        const messages = await Message.find({
            'roomId': room_id
        }).sort({"createdAt": 1}) // 1 meaning ascending
        .limit(per_page) // Just retrieves 2 documents
        .skip(page*per_page); // like offset, skip the first 5 documents
        console.log("Already find: ", messages.length)
        res.status(200).send({
            'messages': messages
        })
    } catch (error) {
        return next(createErrors[500]("An error occurs!"))
    }
}
const createMessage = async (req, res, next) => {
    try{
        const user_id = req.user.id
        const {
            recipientId,
            messageBody
        } = req.body;
        const match = await Match.findOne({
            "users": { "$all": [user_id, recipientId]}
        })
        if(!match)
        return next(createErrors[400]('Bad Request!'))

        const message = await Message.create({
            'senderId': user_id,
            'recipientId': recipientId,
            'messageBody': messageBody
        })
        
        match.newestMessage = message;
        await match.save()
       
        socket.sendTo(user_id, 'newMessage', message);
        socket.sendTo(recipientId, 'newMessage', message);
        const recipientProfile = await Profile.findOne({
            'userId': recipientId
        }, {
            'userId': 1,
            'photos': 1,
            'fullName': 1,
            'userId': 1
        })
        const senderProfile = await Profile.findOne({
            'userId': user_id
        }, {
            'userId': 1,
            'photos': 1,
            'fullName': 1,
            'userId': 1
        })
        
        socket.sendTo(user_id, 'newChattedPartner', {
            'userId': recipientProfile.userId,
            'photos': recipientProfile.photos,
            'fullName': recipientProfile.fullName,
            'newestMessage': message.messageBody,
            'senderId': message.senderId,
        });
        socket.sendTo(recipientId, 'newChattedPartner', {
            'userId': senderProfile.userId,
            'photos': senderProfile.photos,
            'fullName': senderProfile.fullName,
            'newestMessage': message.messageBody,
            'senderId': message.senderId,
        });
        res.status(201).send(message.toJSON())
    }catch(error){
        console.log(error)
        return next(createErrors[500]("An error occurs!"))
    }   
}
const getAvailablePrivateRoom = async (req, res, next) => {
    try {
        let room = await Room.findOne({
            "users": {
                'size': 1
            } 
        })
        if(!room){
            room = Room.create({
                'users': [req.user.id]
            })
        }
        res.status(201).send({
            'roomId': room._id
        })
    } catch (error) {
        return next(createErrors[500]("An error occurs!"))
    }
}
const createPrivateMessage = async (req, res, next) => {
    try{
        const user_id = req.user.id
        const {
            room_id,
            messageBody
        } = req.body;
        
        const room = await Room.findOne({
            "_id": room_id
        })
        if(!room)
        return next(createErrors[400]('Bad Request!'))

        const message = await Message.create({
            'senderId': user_id,
            'messageBody': messageBody,
            'roomId': room._id
        })
        
        room.newestMessage = message;
        await room.save()
        const recipientId = (room.users[0] == user_id)? room.users[1]: room.users[0];

        socket.sendTo(user_id, 'newPrivateMessage', message);
        socket.sendTo(recipientId, 'newPrivateMessage', message);
        const recipientProfile = await Profile.findOne({
            'userId': recipientId
        }, {
            'fullName': 1,
            'userId': 1
        })
        const senderProfile = await Profile.findOne({
            'userId': user_id
        }, {
            'fullName': 1,
            'userId': 1
        })
        
        socket.sendTo(user_id, 'newPrivatelyChattedPartner', {
            'userId': recipientProfile.userId,
            'fullName': recipientProfile.fullName,
            'newestMessage': message.messageBody,
            'senderId': message.senderId,
        });
        socket.sendTo(recipientId, 'newChattedPartner', {
            'userId': senderProfile.userId,
            'fullName': senderProfile.fullName,
            'newestMessage': message.messageBody,
            'senderId': message.senderId,
        });
        res.status(201).send(message.toJSON())
    }catch(error){
        console.log(error)
        return next(createErrors[500]("An error occurs!"))
    }   
}

module.exports = {
    getMessage,
    getPrivateMessages,
    createMessage,
    createPrivateMessage,
    getAvailablePrivateRoom
}