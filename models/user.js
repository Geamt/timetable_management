const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_name : {type:String , required : true, unique : true},
    person_id : { type:mongoose.Schema.Types.ObjectId , required : true},//, ref : ''}
    password : { type: String , required : true},
    course_id : { type:mongoose.Schema.Types.ObjectId ,required : true},
    type_id : { type:mongoose.Schema.Types.ObjectId , required : true}//, ref : ''}
});

module.exports = mongoose.model('User',userSchema);