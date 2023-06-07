const fs = require("fs");

let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf-8", (err, data) => {
      if (err) {
        reject("Unable to read posts file");
        return;
      }
      posts = JSON.parse(data);
      resolve(posts);
      fs.readFile("./data/categories.json", "utf-8", (err, data) => {
        if (err) {
          reject("Unable to read categories file");
          return;
        }
        categories = JSON.parse(data);

        resolve(categories);
      });
    });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("No results returned");
    } else {
      resolve(posts);
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const post = items.filter((item) => item.published === true);

    if (post.length === 0) {
      reject("No results returned");
    } else {
      resolve(post);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
};
