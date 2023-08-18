const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});
let User;
function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(
      "mongodb+srv://ocean003:" +
        "aishK_2003" +
        "@cluster0.zniq9s6.mongodb.net/?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    //creates a connection, works on authorization, if not, rejects with error
    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

//data validation
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt //hashes password
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;
          let newUser = new User(userData);
          newUser //saves new user
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              //catches for any error
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject(`There was an error creating the user: ${err}`);
              }
            });
        })
        .catch((err) => {
          console.log(err);
          reject("Error in password encryption");
        });
    }
  });
}

//validates login credentials
function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          //if user exists
          bcrypt
            .compare(userData.password, users[0].password) //compares passwords
            .then((result) => {
              if (result === true) {
                resolve(users[0]);
              } else {
                reject("Incorrect Password");
              }
            });
          users[0].loginHistory.push({
            //if found: sees login history
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });
          User.updateOne(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } },
            { multi: false }
          )
            .exec()
            .then(() => {
              resolve(users[0]);
            })
            .catch((err) => {
              reject(`Error verifying the user: ${err}`);
            });
        }
      })
      .catch(() => {
        reject("Cannot to find user");
      });
  });
}
module.exports = {
  initialize,
  registerUser,
  checkUser,
};
