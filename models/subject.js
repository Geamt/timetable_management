const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    sub_code : {type:String , required : true},
    sub_name : {type:String , required : true}
});

module.exports = mongoose.model('Subject',subjectSchema);