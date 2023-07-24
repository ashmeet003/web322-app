/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: _Ashmeet Kaur_ Student ID: _122421217_ Date: _July 24th, 2023_
 *
 *  Cyclic Web App URL: https://blue-violet-chipmunk-yoke.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/ashmeet003/web322-app
 *
 ********************************************************************************/

const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require("strip-js");
const blogData = require("./blog-service.js");
const app = express();
const upload = multer();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));
app.set("view engine", ".hbs");
const {
  initialize,
  getAllPosts,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
} = require("./blog-service.js");

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

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
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

// Configuring Cloudinary
cloudinary.config({
  cloud_name: "dhy5y98hb",
  api_key: "437979721979817",
  api_secret: "h9HDNTHQnMYXFAJEJP9nJB0ymvU",
  secure: true,
});

// home page
app.get("/", (req, res) => {
  res.redirect("/blog");
});

// about
app.get("/about", (req, res) => {
  res.render("about");
});

// blog
app.get("/blog", async (req, res) => {
  let viewData = {};
  try {
    let posts = [];
    const { category } = req.query;
    if (category) {
      posts = await blogData.getPublishedPostsByCategory(category);
    } else {
      posts = await blogData.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    let post = posts[0];
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    let categories = await blogData.getCategories(); //get all categories
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("blog", { data: viewData });
});

//posts
app.get("/posts", (req, res) => {
  const { category, minDate } = req.query;
  if (category) {
    getPostsByCategory(category)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (minDate) {
    getPostsByMinDate(minDate)
      .then((data) => {
        res.render("posts", { posts: data });
      })
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

// add post(get)
app.get("/posts/add", (req, res) => {
  res.render("addPost");
});

// add post(post)
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  // Configuring cloudinary image uploading
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
    return result;
  }

  upload(req)
    .then((uploaded) => {
      req.body.featureImage = uploaded.url;
      let postObject = {};

      // Add it Blog Post before redirecting to /posts
      postObject.body = req.body.body;
      postObject.title = req.body.title;
      postObject.postDate = new Date().toISOString().slice(0, 10);
      postObject.category = req.body.category;
      postObject.featureImage = req.body.featureImage;
      postObject.published = req.body.published;
      if (postObject.title) {
        addPost(postObject);
      }
      res.redirect("/posts");
    })
    // Error Handling
    .catch((err) => {
      res.send(err);
    });
});

// post by id
app.get("/post/:value", (req, res) => {
  getPostById(req.params.value)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// categories
app.get("/categories", (req, res) => {
  getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

// blog by id
app.get("/blog/:id", async (req, res) => {
  let viewData = {};
  try {
    let posts = [];
    const { category } = req.query;
    if (category) {
      posts = await blogData.getPublishedPostsByCategory(category);
    } else {
      posts = await blogData.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    let categories = await blogData.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  res.render("blog", { data: viewData });
});

app.use((req, res) => {
  res.status(404).render("404");
});

initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Express http server listening on: " + HTTP_PORT);
  });
});
