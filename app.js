const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {

});

/*app.post("/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        
    try {
        // Create a new user
        const newUser = new User({
            email: req.body.username,
            password: hash
        });

        // Save the user to the database
        newUser.save();
        console.log("Saved new User!");
        res.render("secrets");
        
        // Redirect or send a response based on your application flow
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
    });
});*/

app.post("/login", function(req, res) {
    
});

/*app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        let existingUser = await User.findOne({ email: username });

        // Check if the user already exists
        if (existingUser) {
            const passwordMatch = await bcrypt.compare(password, existingUser.password);
            if (passwordMatch) {
                res.render("secrets");
                console.log("User Logged in Successfully!");
            } else {
                console.log("Incorrect password. User not logged in.");
                // You might want to redirect or show an error message here.
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});*/

app.get("/logout", function(req, res) {
    res.render("home");
    console.log("User Logged out Successfully!");
});

app.get("/submit", function(req, res){
    res.render("submit");
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on port ${port}!!`);
});