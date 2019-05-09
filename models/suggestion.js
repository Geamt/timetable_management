const mongoose = require('mongoose');

const suggestionSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    content : {type:String , required : true, unique : true},
    time : { type : String },
    date : { type : String},
    sem : {type : String },
    suggester : { type:mongoose.Schema.Types.ObjectId,required : true, ref : 'User'},
    suggestion_taker : { type:mongoose.Schema.Types.ObjectId,required : true ,ref : 'User'},
});

module.exports = mongoose.model('Suggestion',suggestionSchema);