import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({gi
    email: String,
    password: String
});

const secret = "OurPrettyLittleSecret.";
userSchema.plugin(encrypt, { 
    secret: secret,
    encryptedFields: ["password"]
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", async function(req, res) {
    try {
        // Create a new user
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        // Save the user to the database
        await newUser.save();
        console.log("Saved new User!");
        res.render("secrets");
        
        // Redirect or send a response based on your application flow
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        let existingUser = await User.findOne({ email: username });

        // Check if the user already exists
        if (existingUser) {
            if (existingUser.password === password) {
                res.render("secrets");
                console.log("User Logged in Successfully!");
            } else {
                console.log("User not found, Register new Account");
            }
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/logout", function(req, res) {
    res.render("home");
    console.log("User Logged out Successfully!");
});

app.get("/submit", function(req, res){
    res.render("submit");
});

app.listen(3000, function() {
    console.log(`Server started on port ${port}!!`);
});