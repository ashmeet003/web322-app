const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "data", "posts.json"),
      "utf8",
      (err, data) => {
        if (err) {
          reject("Unable to read posts file"); // Error Handling
        }
        posts = JSON.parse(data);
        fs.readFile(
          path.join(__dirname, "data", "categories.json"),
          "utf8",
          (err, data) => {
            if (err) {
              reject("Unable to read categories file");
            }
            categories = JSON.parse(data);
            resolve();
          }
        );
      }
    );
  });
}

function getAllPosts() {
  //all posts object
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("No results returned");
    } else {
      resolve(posts);
    }
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve(postData);
  });
}

function getPostById(id) {
  // filters posts by idea
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.id == id);
    const uniquePost = filteredPosts[0];

    if (uniquePost) {
      resolve(uniquePost);
    } else {
      reject("no result returned");
    }
  });
}

function getPublishedPosts() {
  //published posts
  return new Promise((resolve, reject) => {
    let publishedPosts = [];
    posts.forEach((post) => {
      if (post.published === true) {
        publishedPosts.push(post);
      }
    });

    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject("No results returned");
    }
  });
}

function getPublishedPostsByCategory(category) {
  //published post by category
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => post.category == category && post.published === true
    );

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

function getCategories() {
  //all categories
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
}

function getPostsByCategory(category) {
  //filter posts by category
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category == category);

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

function getPostsByMinDate(minDate) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDate)
    );

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

function getPublishedPostsByCategory(category) {
  //published post by category
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => post.category == category && post.published === true
    );

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
  getPublishedPostsByCategory,
};
