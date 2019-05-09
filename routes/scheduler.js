var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var lowerCase = require("lower-case");
var upperCase = require("upper-case");
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
var CheckAuth = require('../middleware/check-auth');



router.use('/', isCurrectUser, function (req, res, next) {
  next();
});

router.get('/', function (req, res, next) {
  res.render('dashboard',{ut : req.session.user_type});
})

router.get('/suggestion', function (req, res, next) {
  res.render('hod_faculties/suggestion');
});

router.get("/index", function (req, res, next) {
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
    result = User.find({course_id : req.session.user.course_id})
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

  async.parallel(queries, function (err, results) {
    if (err) {
      res.json({ err: "error" });
    } else {
      //res.json({ sems: results[0], duration: results[1], days: results[2], class_length: results[3], clss: clss });
      //res.json({ sems: results[0], duration: results[1], days: results[2], time_slots: results[3], clss: clss });
      res.render("scheduler/index", {
        sems: results[0],
        duration: results[1],
        days: results[2],
        time_slot: results[3],
        faculty: results[4],
        vanue: results[5],
        subject: results[6],
        clss: results[7]
      });
      //res.json({ sems: results[0], duration: results[1], days: results[2], time_slot: results[3] ,faculty : results[4] ,vanue : results[5], subject : results[6], clss: results[7] });
    }
  });
});

router.post('/add_timetable', function (req, res, next) {
  duration = req.body.duration;
  course = req.session.user.course_id;
  time_table = JSON.parse(req.body.tt);

  Subject_allocation.find({ duration_id: duration, course_id: course }).exec()
    .then(result => {
      if (result.length > 0) {
        res.json({
          status: 404,
          ms: "find"
        });
      }
      else {
        const sub_alloc = new Subject_allocation({
          _id: new mongoose.Types.ObjectId(),
          duration_id: duration,
          course_id: course,
          time_table: time_table
        });

        sub_alloc.save()
          .then(result1 => {
            res.json({
              status: 200,
            });
          }).catch(err1 => {
            res.json({
              status: 404,
              ms: "create error"
            });
          });
      }
    })
    .catch(err => {
      res.json({
        status: 404,
        ms: "find error"
      });
    });
});


////////////////////////////////////////////////////

router.get('/update_timetable', function (req, res, json) {
  var data = [];
  Subject_allocation.find().populate('duration_id').exec().then(results => {
    for (var i = 0; i < results.length; i++) {
      data.push({ _id: results[i].duration_id._id, start: results[i].duration_id.start_duration, end: results[i].duration_id.end_duration });
      if (i == results.length - 1) {
        res.render('scheduler/update_timetable',{durations : data});
      }
    }
  }).catch(err => {
    res.json({
      status: 404
    })
  });
});

router.post('/update_timetable_detail',function(req,res,next){
  var tid = req.body.tid;
  console.log("tt : "+tid);
  Subject_allocation.find({duration_id : tid}).exec().then(result =>{
      if(result.length > 0)
      {
        req.session.tt = tid;
        res.json({
          status : 200,
          url : "update_timetable_page",
        });
        //res.redirect('/update_timetable_detail',{result : result});
      }
      else
      {
        res.json({
          status : 404
        })
      }
  }).catch(err => {

  });
});

router.get('/update_timetable_page',function(req,res,next){
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
    result = User.find(/*{course_id : req.session.user.course_id}*/)
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

  async.parallel(queries, function (err, results) {
    if (err) {
      res.json({ err: "error" });
    } else {
      //res.json({ sems: results[0], duration: results[1], days: results[2], class_length: results[3], clss: clss });
      //res.json({ sems: results[0], duration: results[1], days: results[2], time_slots: results[3], clss: clss });
      res.render("scheduler/update_timetable_detail", {
        sems: results[0],
        duration: results[1],
        days: results[2],
        time_slot: results[3],
        faculty: results[4],
        vanue: results[5],
        subject: results[6],
        clss: results[7]
      });
      //res.json({ sems: results[0], duration: results[1], days: results[2], time_slot: results[3] ,faculty : results[4] ,vanue : results[5], subject : results[6], clss: results[7] });
    }
  });
});
router.post('/get_data_for_update',function(req,res,next){
  //console.log(req.session.tt + "   "+ req.session.user['course_id']);
  Subject_allocation.find({duration_id : req.session.tt,course_id : req.session.user['course_id']}).exec()
  .then(result =>{
    //console.log('hello');
    if(result.length>0)
    {
      req.session.tt = result[0]['_id'];
      res.json({
        status : 200,
        time_table : result[0]
      })
    }
    else
    {
      res.json({
        status : 404,
      })
    }
  })
  .catch(err =>{
    res.json({
      status : 404,
    })
  });
});

router.post('/update_time_table_data',function(req,res,next){
  duration = req.body.duration;
  course = req.session.user.course_id;
  time_table = JSON.parse(req.body.tt);
  allocation = req.session.tt;

  Subject_allocation.findByIdAndUpdate(allocation,{$set :{
    duration_id: duration,
    course_id: course,
    time_table: time_table
  }})
  .then(result =>{
    res.json({
      status : 200,
      url : 'http://localhost:3000/scheduler/'
    })
    
  })
  .catch({
    status : 404,
  });
  /*Subject_allocation.findById(allocation).exec()
    .then(result => {
      if (result.length < 1) {
        res.json({
          status: 404,
          ms: "find"
        });
      }
      else {
        const sub_alloc = new Subject_allocation({
          _id: new mongoose.Types.ObjectId(),
          duration_id: duration,
          course_id: course,
          time_table: time_table
        });

        sub_alloc.save()
          .then(result1 => {
            res.json({
              status: 200,
            });
          }).catch(err1 => {
            res.json({
              status: 404,
              ms: "create error"
            });
          });
      }
    })
    .catch(err => {
      res.json({
        status: 404,
        ms: "find error"
      });
    });*/
});


/////////////////////////////////////////////////////
router.post("/get_classes_by_sem", function (req, res, next) {
  var sem = req.body.sem;

  Classes.find({ sem_id: req.body.sem })
    .populate("sem_id")
    .select("class")
    .sort({ class: 1 })
    .exec()
    .then(result1 => {
      clss = result1.map(doc => {
        return { _id: doc._id, class: upperCase(doc.class) };
      });

      res.json({
        status: 200,
        clss: clss
      });
    })
    .catch(err1 => {
      res.json({
        status: 404
      });
    });
});

router.post("/check_duration", function (req, res, next) {
  var duration = req.body.duration;
  Subject_allocation.find({ duration_id: duration })
    .exec()
    .then(result => {
      if (result.length == 0) {
        res.json({ status: 200 });
      } else {
        res.json({ status: 404 });
      }
    })
    .catch(err => {
      res.json({ status: 404 });
    });
});



router.get("/add_classes", function (req, res, next) {
  Classes.find()
    .exec()
    .then(result => {
      const ans = result.map(doc => {
        return {
          _id: doc._id,
          class: upperCase(doc.class)
        };
      });
      res.render("scheduler/add_classes", { classes: ans });
    })
    .catch();
});

router.post("/get_classes", function (req, res, next) {
  Classes.find()
    .exec()
    .then(result => {
      const ans = result.map(doc => {
        return {
          _id: doc._id,
          class: upperCase(doc.class)
        };
      });

      res.json({
        status: 200,
        data: ans
      });
    })
    .catch(err => {
      res.json({
        status: 404
      });
    });
});

router.post("/add_classes", function (req, res, next) {
  Classes.find({ class: lowerCase(req.body.class) })
    .exec()
    .then(result => {
      if (result == 0) {
        const cls = new Classes({
          _id: new mongoose.Types.ObjectId(),
          class: lowerCase(req.body.class)
          //sem_id: req.body.sem,
          //course_id: req.session.user.course_id
        });

        cls
          .save()
          .then(result1 => {
            return res.json({
              status: 200
            });
          })
          .catch(err1 => {
            return res.json({
              status: 404
            });
          });
      } else {
        return res.json({
          status: 404,
          msg: "class already exist"
        });
      }
    })
    .catch(err => {
      return res.json({
        status: 404,
        msg: "Something goes wrong"
      });
    });
});

router.post("/remove_classes", function (req, res, next) {

  var state = false;
  Subject_allocation.find().exec().then(results => {
    results.forEach(result => {
      data = SearchByKey(result.time_table, req.body.class);
      if (Object.entries(data).length == 0) {
        state = true;
        Classes.findByIdAndDelete(req.body.class)
          .exec()
          .then(result => {
            return res.json({
              status: 200
            });
          })
          .catch(err => {
            return res.json({
              status: 404
            });
          });
      }
    });
    if (state == false) {
      res.json({
        status: 404
      });
    }
  }).catch(err => {
    res.json({
      status: 404
    });
  });
});

///////////////////////////////////




///////////////////////////////////////////////////////////////////////
router.get('/test', async (req, res, next) => {

  await Subject_allocation.find().exec().then(results => {

    results.forEach(async result => {
      console.log(result.time_table);
      data = {};
      data = await SearchByKey(result.time_table, "5c9567e36b3f200ad890d4d5");
      //data = SearchByKey(result.time_table,"5c8ece71361a941d68c9dbe2");
      console.log("result : " + JSON.stringify(data))
      return res.json({
        data
      });
    });
  }).catch();


});



function isCurrectUser(req, res, next) {
  if (req.session.user_type == 3) {
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
