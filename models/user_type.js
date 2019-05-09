const mongoose = require('mongoose');

const userTypeSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    type : {type:String , required : true, unique : true},
});

module.exports = mongoose.model('User_Type',userTypeSchema);