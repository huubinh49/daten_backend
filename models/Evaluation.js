const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
    evaluatingUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    evaluatedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    evaluation: {
        type: Number,
        enum: [-1, 0, 1], // -1: rejected, 1: matched, 0: evaluating
        required: true
    }
},
{
  timestamps: true
})

module.exports = Evaluation = mongoose.model('Evaluation', EvaluationSchema);