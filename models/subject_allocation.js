const mongoose = require('mongoose');

const subjectAllocationSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    duration_id : { type:mongoose.Schema.Types.ObjectId,required : true,ref : 'Year'},
    course_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    time_table : { type:Object,required : true }
    /*sub_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    user_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    course_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    time_slot_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    day_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    place_id: { type:mongoose.Schema.Types.ObjectId,required : true},
    sem_id: { type:mongoose.Schema.Types.ObjectId,required : true},*/
});

module.exports = mongoose.model('SubjectAllocation',subjectAllocationSchema);