var express = require('express');
var router = express.Router();
const format = require('node.date-time');
var lowerCase = require('lower-case');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var User_Type = require('../models/user_type');
var User = require('../models/user');
var Person = require('../models/person_info');
var checkAuth = require('../middleware/check-auth');
//var session = require('express-session');



/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/login');
}); 
/*router.get('/test', function (req, res, next) {
  res.render('test');
  /*var date = new Date().format("Y-M-d");
  res.json({
    date: date
  })
});*/

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  var user;
  //console.log("user_name"+req.body.user_name)
  Person.find({ email: lowerCase(req.body.user_name) }).exec()
    .then(result => {

      if (result.length != 1) {
        res.json({
          status: 404,
          ms: "Something goes wrong",
          temp: result.length
        })
      }
      else {
        User.find({ person_id: result[0]._id }).exec()
          .then(result1 => {
            if (result1.length != 1) {
              return res.json({
                status: 404,
                ms: "user find error"
              });

            }
            else {
              const usr = result1.map(doc => {
                return {
                  id: doc._id,
                  name: doc.user_name,
                  person_id: doc.person_id,
                  course_id: doc.course_id,
                  type_id: doc.type_id
                }
              });

              bcrypt.compare(req.body.passwd, result1[0].password, function (err, answer) {
                if (err) {
                  return res.json({
                    status: 404,
                    ms: "bycrypt"
                  });
                }
                else if (answer) {

                  const token = jwt.sign({
                    user_name: result1[0].user_name,
                    user_id: result1[0]._id
                  },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' });

                  User_Type.findById(result1[0].type_id).exec().then(usr_type => {
                    console.log(usr_type.type);
                    if (usr_type.type == "admin") {
                      req.session.user_type = 1;
                      req.session.dashboard = "admin";
                    }
                    else if (usr_type.type == "hod") {
                      req.session.user_type = 2;
                      req.session.dashboard = "hod";
                    }
                    else if(usr_type.type == "scheduler")
                    {
                      req.session.user_type = 3;
                      req.session.dashboard = "scheduler";
                    }
                    else if (usr_type.type == "faculty") {
                      req.session.user_type = 4;
                      req.session.dashboard = "faculty";
                    }
                    req.session.user = usr[0];
                    req.session.token = token;
                    
                    console.log(req.session.user);
                    console.log(req.session.token);
                    //res.redirect(301, req.session.dashboard);
                    res.json({
                      status : 200,
                      url : req.session.dashboard
                    });
                    
                  }).catch(err => {
                    return res.json({
                      status: 404,
                      ms: "user_type"
                    });
                  });
                }
              });
            }
          })
          .catch(err => {
            return res.json({
              status: 404,
              ms: "user"
            });
          });
      }
    })
    .catch(err => {
      res.json({
        error: err,
        ms: "person"
      })
    });
  
});



router.get('/logout', function (req, res, next) {
  req.session.destroy(function(err){
    if(err) console.log("LOGOUT ERROR");
    res.clearCookie(process.env.SESS_NAME);
    res.redirect('/login');
  });

})

router.get('/test', checkAuth, function (req, res, next) {
  data = {
    id : "201506100110137",
    result : {
      name : "Gautam"
    }
  }

  res.render('test',{rs : data});

});

module.exports = router;

/*function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req,res,next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}*/
