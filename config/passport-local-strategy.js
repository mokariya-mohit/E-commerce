const passport = require("passport");

const passportLocal = require("passport-local").Strategy;

const Admin = require("../models/Admin");

passport.use(
    new passportLocal(
        {
            usernameField: "email",
        },
        async (email, password, done) => {
            let adminData = await Admin.findOne({ email: email });
            if (adminData) {
                if (adminData.password == password) {
                    return done(null, adminData);
                } else {
                    console.log("Invalid Password");
                    return done(null, false);
                }
            } else {
                console.log("Invalid Email Address");
                return done(null, false);
            }
        }
    )
);

passport.serializeUser(async (admin, done) => {
    return done(null, admin.id);
});

passport.deserializeUser(async (id, done) => {
    let adminRecord = await Admin.findById(id);
    if (adminRecord) {
        return done(null, adminRecord);
    } else {
        return done(null, false);
    }
});

passport.setAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    return next();
};

passport.checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.redirect("/admin");
    }
};

module.exports = passport;
