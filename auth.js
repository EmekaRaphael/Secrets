const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");
router.get("/google", passport.authenticate("google", { scope: ["profile"] }))
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: 'http://localhost:3000/',
    failureRedirect: 'http://localhost:4000/auth/google'
})
)

//LOGIN WITHOUT PASSPORTJS
router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      // if(!user) return res.status(400).json("Wrong credentials!");
      !user && res.status(400).json("Wrong credentials!");
  
      const validated = await bcrypt.compare(req.body.password, user.password);
      // if(!validated) return res.status(400).json("Wrong credentials!");
      !validated && res.status(400).json("Wrong credentials!");
  
      const { password, ...others } = user._doc;
      return res.status(200).json(others);
    } catch (err) {
      return res.status(500).json(err);
    }
  });