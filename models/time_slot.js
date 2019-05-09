const mongoose = require('mongoose');

const timeSlotSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    start_time : {type:String , required : true},
    end_time : {type:String , required : true}
});

module.exports = mongoose.model('Time_Slot',timeSlotSchema);