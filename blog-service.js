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

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    let postsByCategory = posts.filter((post) => post.category === category);
    if (postsByCategory.length > 0) {
      resolve(postsByCategory);
    } else {
      reject("No results returned");
    }
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    let minDate = new Date(minDateStr);
    let postsByMinDate = posts.filter(
      (post) => new Date(post.postDate) >= minDate
    );
    if (postsByMinDate.length > 0) {
      resolve(postsByMinDate);
    } else {
      reject("No results returned");
    }
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    let post = posts.find((post) => post.id === id);
    if (post) {
      resolve(post);
    } else {
      reject("No result returned");
    }
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
};
