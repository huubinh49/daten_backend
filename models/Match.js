const mongoose = require('mongoose');
const { MessageSchema } = require('./Message');

const MatchSchema = mongoose.Schema({
    users: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true
   },
   newestMessage: {
     type: MessageSchema
   }
},
{
  timestamps: true
});
module.exports = Match = mongoose.model("Match", MatchSchema);