const jwt = require('jsonwebtoken');
//var session = require('express-session');


module.exports = function (req, res, next) {

    try {
        //const token = req.headers.authorization.split(" ")[1];
        //const token = req.session.token;
        console.log("hello");
        console.log(req.session);
        //console.log("session" + req.session.token);
        if (req.session.token!=null) {
            console.log("hello2");
            const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET);
            //const decoded = jwt.verify(req.body.token ,process.env.JWT_KEY);
            console.log(JSON.stringify(decoded));
            //console.log("hello");
            next();
        }
        else
        {
            res.redirect('/login');
        }

    }
    catch (error) {
        return res.status(200).json({
            status : 404
        });
    }


}