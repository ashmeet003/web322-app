/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: _Ashmeet Kaur_ Student ID: _122421217_ Date: _June 19th, 2023_
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
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const HTTP_PORT = process.env.PORT || 8080;
const {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
  getPublishedPostsByCategory,
} = require("./blog-service.js");
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

// This will add the property "activeRoute" to "app.locals" whenever the route changes
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Register handlebars as the rendering engine for views
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    // Handlebars custom helper to create active navigation links
    // Usage: {{#navLink "/about"}}About{{/navLink}}
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      // Handlebars custom helper to check for equality
      // Usage: {{#equal value1 value2}}...{{/equal}}
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
    },
  })
);
app.set("view engine", ".hbs");

// Define routes
app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/posts/add", (req, res) => {
  res.render("addPost");
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
  const { category, minDate } = req.query;

  if (category) {
    getPostsByCategory(category)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (minDate) {
    getPostsByMinDate(minDate)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else {
    getAllPosts()
      .then((data) => {
        res.render("posts", { posts: data });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// /categories route
app.get("/categories", (req, res) => {
  getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    // Error Handling
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/post/:value", (req, res) => {
  getPostById(req.params.value)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
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
    let postObject = {};

    // Add it Blog Post before redirecting to /posts
    postObject.body = req.body.body;
    postObject.title = req.body.title;
    postObject.postDate = Date.now();
    postObject.category = req.body.category;
    postObject.featureImage = req.body.featureImage;
    postObject.published = req.body.published;

    // Adding the post if everything is okay
    // Only add the post if the entries make sense
    if (postObject.title) {
      addPost(postObject);
    }
    res.redirect("/posts");
  }
});

//blog/id here:

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};
  try {
    // declare empty array to hold "post" objects
    let posts = [];
    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }
    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    // Obtain the post by "id"
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();
    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

//in initialization and handling 404
app.use((req, res) => {
  res.status(404).render("404");
});

initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Express http server listening on: " + HTTP_PORT);
  });
});
