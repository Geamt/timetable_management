const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    venue : {type:String , required : true}
});

module.exports = mongoose.model('Place',placeSchema);