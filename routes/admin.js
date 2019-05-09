var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var lowerCase = require('lower-case');
var upperCase = require('upper-case');
var User_Type = require('../models/user_type');
var User = require('../models/user');
var Person_info = require('../models/person_info');
var Course = require('../models/course');
var Sem = require('../models/semester');
var TS = require('../models/time_slot');
var Classes = require('../models/classes');
const Place = require('../models/places');
const Duration = require('../models/years');
const Subject = require('../models/subject');
var Subject_allocation = require("../models/subject_allocation");
var async = require('async');
var DateTime = require('node-datetime');
var arraySort = require('array-sort');
var SearchByKey = require('../models/seachByKey');
var SearchByValue = require('../models/searchByValue');
var CheckAuth = require('../middleware/check-auth');



router.use('/', isCurrectUser, function (req, res, next) {
  next();
});
router.get('/', function (req, res, next) {
  res.render('dashboard',{ut : req.session.user_type});
})
///////////////////////////////////////////////////////////////////////////////
//User

router.get('/adduser', function (req, res, next) {
  var queries = [];
  queries.push(function (cb) {
    result = User_Type.find().exec().then((result) => {
      const user_types = result.map(doc => {
        return {
          _id: doc._id,
          type: doc.type
        }
      })
      cb(null, user_types);
    }).catch((err) => {
      throw cb(err);
    });;
  });
  queries.push(function (cb) {
    result = Course.find().exec().then((result) => {
      cb(null, result);
    }).catch((err) => {
      throw cb(err);
    });;
  });

  async.parallel(queries, function (err, results) {
    if (err) {
      res.render('error');
    }

    else {
      res.render('admin/add_user', { user_types: results[0], courses: results[1] });
    }
  })

});

router.post('/adduser', function (req, res, next) {
  Person_info.find({ email: lowerCase(req.body.email) }).exec()
    .then(result => {
      if (result > 0) {
        return res.json({
          status: 404,
          msg: "email alredy"
        })
      }
      else {
        bcrypt.hash("password", 10, function (bcrypt_err, hash) {
          if (bcrypt_err) {
            return res.status(200).json({
              status: 500,
              error: err,
              msg: "bcrypt error"
            })
          }
          else {
            const dob_date = new Date(req.body.dob);
            const person = new Person_info({
              _id: new mongoose.Types.ObjectId(),
              email: lowerCase(req.body.email),
              name: lowerCase(req.body.name),
              dob: dob_date.format('Y-M-d'),
              contact_no: req.body.contact_no,

            });

            console.log(person);

            person.save()
              .then(result1 => {

                const user = new User({
                  _id: new mongoose.Types.ObjectId(),
                  user_name: lowerCase(req.body.user_name),
                  person_id: result1._id,
                  password: hash,
                  course_id: req.body.course,
                  type_id: req.body.user_type
                });
                user.save()
                  .then(result2 => {
                    return res.status(200).json({
                      status: 200
                    });
                  })
                  .catch(err2 => {
                    return res.status(200).json({
                      status: 500,
                      error: err,
                      msg: "user generation error"
                    })
                  });
              })
              .catch(err1 => {
                return res.json({
                  status: 404,
                  msg: "person generation error"
                });
              });
          }
        });
      }
    }).catch(err => {
      return res.json({
        status: 404,
        msg: 'person email finding error'
      });
    });
});

router.post('/checkuser', function (req, res, next) {
  User.find({ user_name: lowerCase(req.body.user_name) }).exec()
    .then(result => {
      //const available;
      if (result.length < 1) {
        available = true
      }
      else {
        available = false
      }
      res.status(200).json({
        status: 200,
        available: available
      })
    })
    .catch(err => {
      res.json({
        status: 404
      })
    });
});

router.post('/get_course', function (req, res, next) {
  /*return res.json({result : "OK"});*/
  Course.find().exec().then(result => {
    return res.json({
      status: 200,
      data: result
    });
  }).catch(err => {
    return res.json({
      status: 404
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//add course | semester | timeslot

router.get('/add', function (req, res, next) {
  var queries = [];
  queries.push(function (cb) {
    result = Course.find().exec().then((result) => {
      cb(null, result);
    }).catch((err) => {
      throw cb(err);
    });;
  });
  queries.push(function (cb) {
    result = Sem.find().exec().then((result) => {
      cb(null, result);
    }).catch((err) => {
      throw cb(err);
    });;
  });
  queries.push(function (cb) {
    result = TS.find().exec().then((result) => {
      arraySort(result, ['start_time', 'end_time']);
      cb(null, result);
    }).catch((err) => {
      throw cb(err);
    });;
  });

  async.parallel(queries, function (err, results) {
    if (err) {
      res.render('error');
    }

    else {
      res.render('admin/add', { courses: results[0], sems: results[1], times: results[2] });
    }
  })
});

////////////////////////
// Course

router.post('/check_course', function (req, res, next) {
  Course.find({ name: lowerCase(req.body.course) }).exec().then(result => {
    if (result.length > 0) {
      return res.json({
        status: 200,
        available: false
      });
    }
    else {
      return res.json({
        status: 200,
        available: true
      });
    }
  }).catch(err => {
    return res.json({
      status: 404
    });
  });
});
router.post('/add_course', function (req, res, next) {

  Course.find({ name: lowerCase(req.body.course) }).exec().then(result => {
    if (result.length > 0) {
      return res.json({
        status: 404,
        msg: 'Course alredy exist'
      });
    }
    else {
      const course = new Course({
        _id: new mongoose.Types.ObjectId(),
        name: lowerCase(req.body.course)
      });

      course.save()
        .then(result => {
          return res.json({
            status: 200
          })
        })
        .catch(err => {
          return res.json({
            status: 501
          });
        });
    }
  }).catch(err => {
    return res.json({
      status: 404
    });
  });

});

router.post('/remove_course', function (req, res, next) {
  User.find({ course_id: req.body.course }).exec()
    .then(delete_result => {
      if (delete_result.length < 1) {
        Course.findByIdAndDelete(req.body.course).exec()
          .then(result => {
            res.json({
              status: 200
            })
          })
          .catch(err => {
            res.json({
              status: 404
            });
          });
      }
      else {
        res.json({
          status: 404
        });
      }
    }).catch(delete_err => {
      res.json({
        status: 404
      });
    });

});


///////////////////////////////////
//Sem
router.post('/check_sem', function (req, res, next) {
  Sem.find({ sem: lowerCase(req.body.sem) }).exec().then(result => {
    if (result.length > 0) {
      return res.json({
        status: 200,
        available: false
      });
    }
    else {
      return res.json({
        status: 200,
        available: true
      });
    }
  }).catch(err => {
    return res.json({
      status: 404
    });
  });
});

router.post('/get_sem', function (req, res, next) {
  Sem.find().sort('sem').exec().then(result => {
    arraySort(result,'sem')
    return res.json({
      status: 200,
      data: result
    })
  }).catch(err => {
    return res.json({
      status: 404
    });
  });
});

router.post('/add_sem', function (req, res, next) {

  Sem.find({ sem: lowerCase(req.body.sem) }).exec().then(result => {
    if (result.length > 0) {
      return res.json({
        status: 404,
        msg: 'Sem alredy exist'
      });
    }
    else {
      const sem = new Sem({
        _id: new mongoose.Types.ObjectId(),
        //duration: req.body.duration,
        sem: req.body.sem
      });
      sem.save().then(result => {
        return res.json({
          status: 200
        });
      }).catch(err => {
        return res.json({
          status: 500
        });
      });
    }
  }).catch(err => {
    return res.json({
      status: 404
    });
  });
});

router.post('/remove_semester', function (req, res, next) {
  /*return res.json({
    status : 200
  });*/
  var state = false;
  Subject_allocation.find().exec().then(results => {
    results.forEach(result => {
      data = SearchByKey(result.time_table, req.body.semester);
      if (Object.entries(data).length == 0) {
        state = true;
        Sem.findByIdAndDelete(req.body.semester).exec()
          .then(result1 => {
            res.json({
              status: 200
            })
          })
          .catch(err1 => {
            res.json({
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


///////////////////////////////////////////////////////
//venue
router.get('/addvenue', function (req, res, next) {
  Place.find().exec()
    .then(result => {
      const rs = result.map(doc => {
        return {
          _id: doc._id,
          venue: upperCase(doc.venue),
        }
      });
      res.render('admin/add_venue', { venues: rs })
      /*res.json({
        data : result
      })*/
    })
    .catch(err => {

    });
});

router.post('/get_venues', function (req, res, next) {
  Place.find().exec()
    .then(result => {
      const rs = result.map(doc => {
        return {
          _id: doc._id,
          venue: upperCase(doc.venue),
        }
      });
      res.json({
        status: 200,
        data: rs,
      });
    })
    .catch(err => {
      res.json({
        status: 404
      });
    });
});

router.post('/add_venue', function (req, res, next) {
  Place.find({ venue: lowerCase(req.body.venue) }).exec()
    .then(result => {
      if (result.length > 0) {
        res.json({
          status: 404
        });
      }
      else {
        const place = Place({
          _id: new mongoose.Types.ObjectId(),
          venue: lowerCase(req.body.venue)
        });

        place.save()
          .then(result1 => {
            res.json({
              status: 200
            });
          }).catch();
      }
    })
    .catch(err => { });
});

router.post('/remove_venue', function (req, res, next) {
  var venue = req.body.venue;
  var state = false;
  Subject_allocation.find().exec().then(results => {
    results.forEach(result => {
      data = SearchByKey(result.time_table, venue);
      if (Object.entries(data).length == 0) {
        state = true;
        Place.findByIdAndDelete(venue).exec()
          .then(result1 => {
            res.json({
              status: 200
            });
          }).catch(err1 => {
            status: 404
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

//////////////////////////////////////////////////////////////////////
//Time Slots

router.post('/get_timeslot', function (req, res, next) {
  // var times=[];
  // var tmp = [];
  // var count = 0;
  // var str = "";
  TS.find().exec()
    .then(result => {

      arraySort(result, ['start_time', 'end_time']);
      res.json({
        status: 200,
        data: result
      })
      /*result.forEach(ltime => {
        get_dt1 = DateTime.create('2000-01-01 ' + ltime.start_time + ':00');
        get_dt2 = DateTime.create('2000-01-01 ' + ltime.end_time + ':00');
  
        times.push(new Date(get_dt1.now()));
        times.push(new Date(get_dt2.now()));
      });
      arraySort(times);
      times.forEach(item => {
        count++;
        str = str + item.format('h:m')
        if(count==1)
        {
          str = str + "-";
        }
        if(count==2)
        {
          tmp.push(str)
          str="";
          count = 0;
        } 
      });
      res.json({
        res : tmp
      })*/

    })
    .catch();
})

router.post('/add_timeslot', function (req, res, next) {

  const dt1 = DateTime.create('2000-01-01 ' + req.body.start_time + ':00');
  const dt2 = DateTime.create('2000-01-01 ' + req.body.end_time + ':00');

  TS.find().exec()
    .then(result => {
      if (result.length == 0) {
        const time_slot = new TS({
          _id: new mongoose.Types.ObjectId(),
          start_time: dt1.format('H:M'),
          end_time: dt2.format('H:M')
        });

        time_slot.save().then(result1 => {
          return res.json({
            status: 200
          })
        }).catch(err2 => {
          res.json({
            status: 404
          });
        });
      }
      else {
        var flag = true;
        result.forEach(ltime => {

          get_dt1 = DateTime.create('2000-01-01 ' + ltime.start_time + ':00');
          get_dt2 = DateTime.create('2000-01-01 ' + ltime.end_time + ':00');
          // console.log(dt1.format('H:M'))
          // console.log(dt2.format('H:M'))
          // console.log(get_dt1.format('H:M'))
          // console.log(get_dt2.format('H:M'))
          // console.log(dt1.getTime() <= get_dt1.getTime())
          // console.log(dt2.getTime() <= get_dt1.getTime())
          // console.log(dt1.getTime() >= get_dt2.getTime())
          // console.log(dt2.getTime() >= get_dt2.getTime())
          if ((dt1.getTime() <= get_dt1.getTime() && dt2.getTime() <= get_dt1.getTime()) || (dt1.getTime() >= get_dt2.getTime() && dt2.getTime() >= get_dt2.getTime())) { }
          else {
            flag = false;
          }
        });
        if (flag) {
          const time_slot = new TS({
            _id: new mongoose.Types.ObjectId(),
            start_time: dt1.format('H:M'),
            end_time: dt2.format('H:M')
          });

          time_slot.save().then(result1 => {
            flag = true;
            return res.json({
              status: 200
            })
          }).catch(err1 => {
            res.json({
              status: 404
            });
          });

        }
        else {
          return res.json({
            status: 404,
          });
        }
      }
    })
    .catch(err => {
      res.json({
        status: 404
      });
    });
  /*const dt1 = DateTime.create('2000-01-01 11:52:00');
  const dt2 = DateTime.create('2000-01-01 10:52:00');
  if (dt1.getTime() > dt2.getTime()) {
    console.log('false');
  }
  else
  {
    console.log('true');
  }*/

});

router.post('/remove_timeslot', function (req, res, next) {

  var state = false;
  Subject_allocation.find().exec().then(results => {
    results.forEach(result => {
      data = SearchByKey(result.time_table, req.body.time_slot);
      if (Object.entries(data).length == 0) {
        state = true;
        TS.findByIdAndDelete(req.body.time_slot).exec()
          .then(result1 => {
            res.json({
              status: 200,
            });
          })
          .catch(err1 => {
            status: 404
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

/////////////////////////////////////////

//add years //




router.get('/add_duration', function (req, res, next) {
  Duration.find().exec().then(result => {
    //console.log(result);
    arraySort(result, ['start_duration', 'end_duration']);
    res.render('admin/add_years', { durations: result });
  }).catch(err => {
  });

});

router.post('/add_duration', function (req, res, next) {
  var start_duration = req.body.start_duration
  var end_duration = req.body.end_duration;

  Duration.find({ start_duration: start_duration, end_duration: end_duration }).exec()
    .then(result => {
      if (result.length < 1) {

        const duration = new Duration({
          _id: new mongoose.Types.ObjectId(),
          start_duration: start_duration,
          end_duration: end_duration
        });

        duration.save().then(result1 => {
          //console.log(result1);
          res.json({
            status: 200
          });
        }).catch(err1 => {
          res.json({
            status: 404
          });
        });
      }
      else {
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
router.post('/get_duration', function (req, res, next) {

  Duration.find().exec().then(result => {
    //console.log(result);
    arraySort(result, ['start_duration', 'end_duration']);
    res.json({
      status: 200,
      data: result
    });
  }).catch(err => {
    status: 404
  });


});

router.post('/remove_duration', function (req, res, next) {
  var duration = req.body.duration;

  Subject_allocation.find({ duration_id: duration }).exec().then(result => {
    if (result.length == 0) {
      Duration.findByIdAndDelete(duration).exec()
        .then(result1 => {
          res.json({
            status: 200
          });
        }).catch(err1 => {
          res.json({
            status: 404
          });
        });
    }
    else {
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

/////////////////////////////////////////////////////////////////////////////////////////////////////
//Subjects??

router.get('/add_subject', function (req, res, next) {
  Subject.find().exec()
    .then(result => {
      res.render('admin/add_subject', { subjects: result });
      /**res.json({
        data : result
      });*/
    }).catch(err => {
      res.json({
        status: 404
      });
    });
});

router.post('/add_subject', function (req, res, next) {
  var sub_code = lowerCase(req.body.sub_code);
  var sub_name = lowerCase(req.body.sub_name);

  Subject.find({ sub_code: sub_code }).exec()
    .then(result => {
      if (result.length == 0) {

        const subject = new Subject({
          _id: new mongoose.Types.ObjectId(),
          sub_code: sub_code,
          sub_name: sub_name
        });

        subject.save()
          .then(result1 => {
            //console.log(result1)
            res.json({
              status: 200,
            });
          }).catch(err1 => {
            console.log("error")
            res.json({
              status: 404,
              mg: "save error"
            });
          });
      }
      else {
        res.json({
          status: 404,
          ms: "found"
        })
      }
    }).catch(err => {
      res.json({
        status: 404,
        ms: "main error"
      });
    });
});

router.post('/get_subject', function (req, res, next) {
  Subject.find().exec()
    .then(result => {
      res.json({
        status: 200,
        data: result
      });
    }).catch(err => {
      res.json({
        status: 404
      });
    });
});

router.post('/remove_subject', function (req, res, next) {
  var subject = req.body.subject;

  var state = false;
  Subject_allocation.find().exec().then(results => {
    results.forEach(result => {
      data = SearchByKey(result.time_table, subject);
      if (Object.entries(data).length == 0) {
        state = true;
        Subject.findByIdAndDelete(subject).exec()
          .then(result1 => {
            res.json({
              status: 200
            });
          }).catch(err1 => {
            status: 404
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

function isCurrectUser(req, res, next) {
  if (req.session.user_type == 1) {
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