const mongoose = require('mongoose');

const semesterSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    //duration : {type:Number , required: true},
    sem : {type:Number , required : true , unique: true},
});

module.exports = mongoose.model('Semester',semesterSchema);