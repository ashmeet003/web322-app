const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject("Unable to read posts file");
        return;
      }
      posts = JSON.parse(data);
      fs.readFile("./data/categories.json", "utf8", (err, data) => {
        if (err) {
          reject("Unable to read categories file");
          return;
        }
        categories = JSON.parse(data);

        resolve();
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
    const publishedPost = posts.filter((post) => post.published === true);

    if (publishedPost.length === 0) {
      reject("No results returned");
    } else {
      resolve(publishedPost);
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

    // Setting the next post id
    postData.id = posts.length + 1;

    // Adding to posts
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

function getPublishedPostsByCategory(category) {
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
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
};
