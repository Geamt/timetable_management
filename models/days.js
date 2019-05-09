const mongoose = require('mongoose');

const daySchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    day_name : {type:String , required : true}
});

module.exports = mongoose.model('Day',daySchema);