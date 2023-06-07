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
      console.log("Server is running on port 8080");
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
