const mongoose = require('mongoose');

const yearSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    start_duration : {type:String , required : true},
    end_duration : {type:String , required : true}
});

module.exports = mongoose.model('Year',yearSchema);