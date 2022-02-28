const mongoose = require('mongoose');
const { MessageSchema } = require("./Message");

const RoomSchema = new mongoose.Schema({
    users: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true
    },
    newestMessage: {
        type: MessageSchema
    }
})

module.exports = Room = mongoose.model('Room', RoomSchema);