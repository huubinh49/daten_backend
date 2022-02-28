const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    recipientId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    messageBody:{
        type: String,
        default: "",
    },
    isSeen: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    roomId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Room"
    }
},
{
  timestamps: true
});

const Message = mongoose.model('Message', MessageSchema)
module.exports = {
    Message,
    MessageSchema
}