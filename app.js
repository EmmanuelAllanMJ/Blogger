//jshint esversion:6
// require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const md5 = require("md5");

const app = express();

app.set("view engine", "ejs");

//Authentication
app.use(
  session({
    secret: "Emmanuel Allan M J ",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));

//Connecting to DB
mongoose.connect(
  "mongodb+srv://admin-pixie:Allan123@cluster0.wr0c9xg.mongodb.net/blogDB"
);

//This is used to say node to use static files like styles.css in public folder
app.use(express.static("public"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let username1;

app.get("/signin", function (req, res) {
  res.render("signIn");
});

// app.get("/", function (req, res) {
//   if (req.isAuthenticated()) {
//     res.render("secrets");
//   } else {
//     res.redirect("login");
//   }
// });

app.post("/signin", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/signin");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      }
    }
  );
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        req.session.context = req.body.username; //to save username
        res.redirect("/");
      });
    }
  });
});

//Creating Schema
const blogSchema = {
  name: String,
  content: String,
  author: String,
};

//Creating model
const Post = mongoose.model("Post", blogSchema);

app.get("/", function (req, res) {
  if (req.session.context != "undefined") {
    User.find({ email: req.session.context }, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        username1 = user.username;
      }
    });
  }
  Post.find({}, function (err, posts) {
    console.log(req.session.context);
    res.render("home", {
      posts: posts,
      username: username1,
    });
  });
});

//Pricing Window
app.get("/pricing", function (req, res) {
  res.render("pricing");
});

//Creating new blog post
app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("compose", { username: req.session.context });
  } else {
    res.render("signin");
  }
});

//Getting title and content and storing to the DB
app.post("/compose", function (req, res) {
  const post = new Post({
    name: req.body.postTitle,
    content: req.body.postBody,
    author: req.session.context.split("@")[0],
  });
  post.save();
  res.render;
  res.redirect("/");
});

//Displaying blogs from DB when clicked
let edit = false;
app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  Post.find({ name: req.params.postName }, function (err, foundPost) {
    foundPost.forEach(function (post) {
      const storedTitle = _.lowerCase(post.name);

      if (storedTitle === requestedTitle) {
        res.render("post", {
          name: post.name,
          content: post.content,
          author: post.author,
          url: storedTitle,
          username: req.session.context,
        });
      }
    });
  });
});

//Editing blog
app.get("/posts/:postName/edit", function (req, res) {
  Post.find({ name: req.params.postName }, function (err, foundPost) {
    res.render("edit", {
      name: foundPost[0].name,
      content: foundPost[0].content,
    });
  });
});

app.post("/posts/:postName/edit", function (req, res) {
  Post.updateOne(
    { name: req.params.postName },
    {
      name: req.body.postTitle,
      content: req.body.postBody,
    },
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
  res.render;
  res.redirect("/");
});

//delete
app.get("/posts/:postName/delete", function (req, res) {
  Post.deleteOne({ name: req.params.postName }, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

//Server running
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
