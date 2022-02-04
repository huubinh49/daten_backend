const createErrors = require("http-errors");
const Message = require('../models/Message');

const getMessage = async (req, res, next) => {
    try{
        const {
            target_id,
            page, 
            per_page
        } = req.query;

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
        res.status(200).send(messages.toJSON())
    }catch(error){
        return next(createErrors[500]("An error occurs!"))
    }
}

const createMessage = async (req, res, next) => {
    try{
        const {
            recipientId,
            messageBody
        } = req.body;
        const matches = Match.findOne({
            "users": { "$all": [user_id]}
        })
        if(!match)
        return next(createErrors[400]('Bad Request!'))

        const message = await Message.create({
            'senderId': req.user.id,
            'recipientId': recipientId,
            'messageBody': messageBody
        })
        match.newestMessage = message._id;
        await match.save()
        res.io.emit('newMessage', message);
        res.status(201).send(message.toJSON())
    }catch(error){
        return next(createErrors[500]("An error occurs!"))
    }   
}

module.exports = {
    getMessage,
    createMessage
}