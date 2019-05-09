var User_Type = require('./../models/user_type');
var Days =require('../models/days');
var mongoose=require('mongoose');

mongoose.connect('mongodb://localhost:27017/ttms',{ useNewUrlParser: true });

var days =[ 
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Monday"
    }),
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Tuesday"
    }),
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Wednesday"
    }),
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Thursday"
    }),
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Friday"
    }),
    new Days({
        _id:new mongoose.Types.ObjectId(),
        day_name: "Saturday"
    }),
];

var done =0;
for(var  i=0; i< days.length;i++)
{
    days[i].save(function(err,result){
        done++;
        if(done===days.length)
        {
            exit();
        }
    });
}
function exit()
{
    mongoose.disconnect();
}

