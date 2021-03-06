var express = require('express');
var router = express.Router();
var SearchByKey = require('../models/seachByKey');
var SearchByValue = require('../models/searchByValue');
var CheckAuth = require('../middleware/check-auth');
var User = require("../models/user");
var Sem = require("../models/semester");
var Classes = require("../models/classes");
var Days = require("../models/days");
var TS = require("../models/time_slot");
var Place = require("../models/places");
var Duration = require("../models/years");
var Subject = require("../models/subject");
var Subject_allocation = require("../models/subject_allocation");
var async = require("async");
var arraySort = require("array-sort");
var SearchByKey = require('../models/seachByKey');
var SearchByValue = require('../models/searchByValue');
var lowerCase = require("lower-case");
var upperCase = require("upper-case");


router.use('/', isCurrectUser, function (req, res, next) {
    next();
});

router.get('/', function (req, res, next) {

    res.render('dashboard',{ut : req.session.user_type});
    //res.render('hod_faculties/index', { title: 'Express' });
});

router.get('/show_tt', function (req, res, next) {
    var queries = [];
    var clss;
    var sorter = {
        // "sunday": 0, //if sunday is first day of week
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };
    queries.push(function (cb) {
        result = Sem.find()
            .sort("sem")
            .exec()
            .then(result => {
                arraySort(result, 'sem')
                cb(null, result);
            })
            .catch(err => {
                cb(err);
            });
    });
    queries.push(function (cb) {
        result = Duration.find()
            .exec()
            .then(result => {
                Subject_allocation.find()
                    .exec()
                    .then(result1 => {
                        arraySort(result, ["start_duration", "end_duration"]);

                        cb(null, result);
                    })
                    .catch();
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = Days.find()
            .select("day_name")
            .exec()
            .then(result => {
                result.sort(function sortByDay(a, b) {
                    var day1 = a.day_name.toLowerCase();
                    var day2 = b.day_name.toLowerCase();
                    return sorter[day1] > sorter[day2];
                });
                cb(null, result);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = TS.find()
            .exec()
            .then(result => {
                console.log("times");
                arraySort(result, ["start_time", "end_time"]);
                cb(null, result);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = Place.find()
            .exec()

            .then(result => {
                const rs = result.map(doc => {
                    return {
                        _id: doc._id,
                        venue: upperCase(doc.venue)
                    };
                });
                //console.log("times")
                //arraySort(result, ['start_time', 'end_time']);
                cb(null, rs);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = Subject.find()
            .exec()
            .then(result => {
                //console.log("times")
                //arraySort(result, ['start_time', 'end_time']);
                cb(null, result);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = Classes.find()
            .exec()
            .then(result => {
                const ans = result.map(doc => {
                    return {
                        _id: doc._id,
                        class: upperCase(doc.class)
                    };
                });
                //console.log("times")
                arraySort(ans, ["class"]);
                cb(null, ans);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    queries.push(function (cb) {
        result = User.find({course_id : req.session.user['course_id'] ,type_id : { $ne: "5c57baf35c96c52a74859c14" }})
            .select("user_name")
            .exec()
            .then(result => {
                //console.log("times")
                //arraySort(result, ['start_time', 'end_time']);
                cb(null, result);
            })
            .catch(err => {
                throw cb(err);
            });
    });
    async.parallel(queries, function (err, results) {
        if (err) {
            res.json({ err: "error" });
        } else {
            //res.json({ sems: results[0], duration: results[1], days: results[2], class_length: results[3], clss: clss });
            //res.json({ sems: results[0], duration: results[1], days: results[2], time_slots: results[3], clss: clss });
            res.render("hod_faculties/hod_view", {
                sems: results[0],
                duration: results[1],
                days: results[2],
                time_slot: results[3],
                vanue: results[4],
                subject: results[5],
                clss: results[6],
                faculty : results[7]
            });
            //res.json({ sems: results[0], duration: results[1], days: results[2], time_slot: results[3], vanue: results[4], subject: results[5], clss: results[6], faculty: results[7] });
        }
    });
});

router.post('/get_tt', function (req, res, next) {
    var getby = req.body.getby;
    var duration = req.body.duration;
    var day = req.body.day;
    var sem = req.body.sem;
    var clss = req.body.clss;
    var faculty = req.body.faculty;
    var course_id = req.session.user['course_id'];
    var sorter = {
        // "sunday": 0, //if sunday is first day of week
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };
    console.log(getby + " " + duration + " " + day + " " + sem + " " + clss + " " + course_id + " "+ faculty);

    if (getby != undefined && duration != undefined && sem != undefined && clss != undefined && day != undefined && faculty!=undefined) {
        Subject_allocation.find({ duration_id: duration, course_id: course_id }).exec()
            .then(result => {
                
                if (result.length > 0) {
                    
                    rs_data = result[0]['time_table'];
                    Days.find()
                        .exec()
                        .then(result1 => {
                            console.log("hello");
                            result1.sort(function sortByDay(a, b) {
                                var day1 = a.day_name.toLowerCase();
                                var day2 = b.day_name.toLowerCase();
                                return sorter[day1] > sorter[day2];
                            });
                            res.json({
                                status: 200,
                                data: rs_data,
                                days: result1.map(doc=>{return { _id : doc._id}}),
                            });
                        })
                        .catch(err1 => {
                            res.json({
                                status: 404,
                            })
                        });
                }

                else {
                    res.json({
                        status: 404,
                    })
                }
            })
            .catch(err => {
                res.json({
                    status: 404,
                })
            });

    }
});





////////////////////////////////////////////////////////////



function isCurrectUser(req, res, next) {
    if (req.session.user_type == 2) {
        return next();
    }
    else {
        //req.session.oldUrl=req.url;
        res.json({
            ms: 'Something goes wrong'
        });
    }
}

module.exports = router;