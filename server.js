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
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const storeService = require("./blog-service");
const port = process.env.PORT || 8080;

//cloudinary
cloudinary.config({
  cloud_name: "dhy5y98hb",
  api_key: "437979721979817",
  api_secret: "h9HDNTHQnMYXFAJEJP9nJB0ymvU",
  secure: true,
});

// Serve static files from the "public" directory
app.use(express.static("public"));
app.use(express.json());
const upload = multer();

// Define routes
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addPost.html"));
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
    .then((posts) => {
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
  const { category, minDate } = req.query;

  if (category) {
    const postsByCategory = storeService.getPostsByCategory(parseInt(category));
    res.json(postsByCategory);
  } else if (minDate) {
    const postsByMinDate = storeService.getPostsByMinDate(minDate);
    res.json(postsByMinDate);
  } else {
    const allPosts = storeService.getAllPosts();
    res.json(allPosts);
  }
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

app.get("/post/value", (req, res) => {
  const id = parseInt(req.params.value);
  const post = storeService.getPostById(id);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// No matching route
app.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
  }
});
