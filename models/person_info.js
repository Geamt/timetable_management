const mongoose = require('mongoose');
require ('mongoose-type-email');

const person_infoSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email : { type:String ,required : true, unique : true},
    name : {type:String , required : true},
    dob : { type:Date , required : true},
    contact_no : { type: String ,required : true}
});

module.exports = mongoose.model('Person_info',person_infoSchema);