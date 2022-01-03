const mongoose = require('mongoose');

const MatchSchema = mongoose.Schema({
    users: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true
    }
},
{
  timestamps: true
});
module.exports = Match = mongoose.model("Match", MatchSchema);