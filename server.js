/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: _Ashmeet Kaur_ Student ID: _122421217_ Date: _August 16, 2023_
 *
 *  Cyclic Web App URL: https://blue-violet-chipmunk-yoke.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/ashmeet003/web322-app
 *
 ********************************************************************************/
const express = require("express");
const multer = require("multer");
const blogData = require("./blog-service.js");
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require("strip-js");
const { resolve } = require("path");
const { redirect } = require("express/lib/response.js");
const app = express();
const upload = multer();
const HTTP_PORT = process.env.PORT || 8080;

const {
  initialize,
  getAllPosts,
  getCategories,
  addPost,
  getPostById,
  getPublishedPostsByCategory,
  getPostsByMinDate,
  addCategory,
  deleteCategoryById,
  deletePostById,
} = require("./blog-service.js");

app.use(express.static("public"));
app.use(
  clientSessions({
    //clientsession
    cookieName: "session",
    secret: "2023blogapplication",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);
app.use(function (req, res, next) {
  //middleware
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    //if invalid>>redirect to login page
    res.redirect("/login");
  } else {
    next();
  }
}
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

app.use(express.urlencoded({ extended: true }));
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
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", ".hbs");
//cloudinary
cloudinary.config({
  cloud_name: "dhy5y98hb",
  api_key: "437979721979817",
  api_secret: "h9HDNTHQnMYXFAJEJP9nJB0ymvU",
  secure: true,
});

//home page
app.get("/", (req, res) => {
  res.redirect("/blog");
});

//about page
app.get("/about", (req, res) => {
  res.render("about");
});

//blog page
app.get("/blog", async (req, res) => {
  let viewData = {};
  try {
    let posts = [];
    const { category } = req.query;
    if (category) {
      //if categories exist, let filtered data be stored in posts
      posts = await blogData.getPublishedPostsByCategory(category);
    } else {
      posts = await blogData.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate)); //sorts
    let post = posts[0];
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    let categories = await blogData.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  if (viewData.posts.length > 0) {
    //to render data correctly
    res.render("blog", { data: viewData });
  } else {
    res.render("blog", {
      data: viewData,
      message: "Please try another post / category",
    });
  }
});

//posts route
app.get("/posts", ensureLogin, (req, res) => {
  const { category, minDate } = req.query;
  if (category) {
    getPublishedPostsByCategory(category)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (minDate) {
    getPostsByMinDate(minDate)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else {
    getAllPosts()
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// add post route
app.get("/posts/add", ensureLogin, (req, res) => {
  getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

// add post route: POST
app.post(
  "/posts/add",
  ensureLogin,
  upload.single("featureImage"),
  (req, res) => {
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
          addPost(postObject).then(() => {
            res.redirect("/posts");
          });
        }
      })
      .catch((err) => {
        res.send(err);
      });
  }
);

// post id route: using values
app.get("/post/:value", (req, res) => {
  getPostById(req.params.value)
    .then((data) => {
      res.send(data);
    })
    // Error
    .catch((err) => {
      res.send(err);
    });
});

//categories
app.get("/categories", ensureLogin, (req, res) => {
  getCategories()
    .then((data) => {
      data.length > 0
        ? res.render("categories", { categories: data })
        : res.render("categories", { message: "No Results" });
    })
    .catch(() => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  //addCategory
  res.render("addCategory");
});

// add categories post route
app.post("/categories/add", ensureLogin, (req, res) => {
  let catObject = {};
  catObject.category = req.body.category;
  if (req.body.category != "") {
    addCategory(catObject)
      .then(() => {
        res.redirect("/categories");
      })
      .catch(() => {
        console.log("Some error occured");
      });
  }
});

// removing id
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

// delete id
app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

app.get("/blog/:id", ensureLogin, async (req, res) => {
  let viewData = {};
  try {
    let posts = [];
    if (req.query.category) {
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
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
  // rendering blog view
  res.render("blog", { data: viewData });
});

// login page
app.get("/login", (req, res) => {
  res.render("login");
});

//register page
app.get("/register", (req, res) => {
  res.render("register");
});

//login page: POST
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/posts");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

//register: POST
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get("/logout", (req, res) => {
  //Logout
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res) => {
  res.status(404).render("404");
});

blogData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log("unable to start server: " + err);
  });
