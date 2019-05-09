const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    class : {type: String ,required : true},
    /*sem_id : { type:mongoose.Schema.Types.ObjectId,required : true , ref : 'Semester'},
    course_id : { type:mongoose.Schema.Types.ObjectId,required : true}*/
});

module.exports = mongoose.model('Class',classSchema);