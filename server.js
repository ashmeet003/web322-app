/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: _Ashmeet Kaur_ Student ID: _122421217_ Date: _June 5th, 2023_
 *
 *  Cyclic Web App URL: https://blue-violet-chipmunk-yoke.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/ashmeet003/web322-app
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
var app = express();
const storeService = require("./blog-service");
const port = process.env.PORT || 8080;
app.use(express.static("public"));

// Define routes
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.listen(port, () => {
  storeService
    .initialize()
    .then(() => {
      console.log("Express http server listening on: " + port);
    })
    .catch((error) => {
      console.error("Error initializing the store service:", error);
      process.exit(1);
    });
});
//step3 get requests
// /blog route
app.get("/blog", (req, res) => {
  storeService
    .getPublishedPosts()
    .then(() => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// /posts route
app.get("/posts", (req, res) => {
  storeService
    .getAllPosts()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// /categories route
app.get("/categories", (req, res) => {
  storeService
    .getCategories()
    .then((categories) => {
      res.json(categories);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// No matching route
app.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});
