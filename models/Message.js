const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    recipentId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    messageBody:{
        type: String,
        default: "",
    },
    isSent: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    isSeen: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    sendDate: {
        type: mongoose.SchemaTypes.Date
    }
});

module.exports = Message = mongoose.model('Message', MessageSchema);