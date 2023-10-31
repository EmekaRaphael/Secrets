const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const saltRounds = 10;

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
     extended: true 
}));


app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://127.0.0.1:27017/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
))

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/oauth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(err, user) {
                console.log("User Registered Successfully");
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // Use passport's local authentication strategy
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            console.error(err);
            return res.redirect("/login");
        }
        if (!user) {
            // Handle incorrect credentials
            console.log("Incorrect username or password");
            return res.redirect("/login");
        }
        req.logIn(user, function(err) {
            if (err) {
                console.error(err);
                return res.redirect("/login");
            }
            // Authentication successful, redirect to secrets page
            console.log("User Logged in Successfully");
            return res.redirect("/secrets");
        });
    })(req, res);
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) {
            // Handle any potential errors here
            console.error(err);
        }
        console.log("User Logged out Successfully!");
        res.redirect("/");
    });
});



app.get("/submit", function(req, res){
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});

app.post("/submit", async function(req, res) {
    const submittedSecret = req.body.secret;
    const userId = req.user.id;

    try {
        const foundUser = await User.findById(userId);

        if (foundUser) {
            foundUser.secret = submittedSecret;
            await foundUser.save();
            res.redirect("/secrets");
        } else {
            console.log("User not found");
            res.redirect("/login");
        }
    } catch (error) {
        console.error(error);
        res.redirect("/login");
    }
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on port ${port}!!`);
});