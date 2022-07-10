//jshint esversion:6
// require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

// const md5 = require("md5");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
//This is used to say node to use static files like styles.css in public folder
app.use(express.static("public"));

//Connecting to DB
mongoose.connect("mongodb://localhost:27017/blogDB");

//Creating Schema
const blogSchema = {
  name: String,
  content: String,
};

//Creating model
const Post = mongoose.model("Post", blogSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    res.render("home", {
      posts: posts,
    });
  });
});

//Pricing Window
app.get("/pricing", function (req, res) {
  res.render("pricing");
});

//Creating new blog post
app.get("/compose", function (req, res) {
  res.render("compose");
});

//Getting title and content and storing to the DB
app.post("/compose", function (req, res) {
  const post = new Post({
    name: req.body.postTitle,
    content: req.body.postBody,
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
          author: true,
          url: storedTitle,
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
