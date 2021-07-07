const bcrypt = require("bcrypt");
//
//............Random string for new URLs
function generateRandomString() {
  const randomChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

//........Get the user by email address
function getUserByEmail(email, users) {
  const keyMatch = Object.keys(users).find((key) => users[key].email === email);
  return keyMatch ? users[keyMatch] : null;
}

//........Get the user by ID
function getUserById(userId, users) {
  return users[userId];
}
//........Check if email is already in the DB
function isDuplicateEmail(email, users) {
  return Object.keys(users).some((key) => users[key].email === email);
}

//........Return the users URLS
function getClientUrls(urlDatabase, userID) {
  let userObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userObj[key] = urlDatabase[key];
    }
  }
  return userObj;
}

//........Validate Password and Email
function checkPasswordValidity(userPass, loginPass) {
  //
  if (bcrypt.compareSync(loginPass, userPass)) {
    return true;
  }
}

module.exports = {
  getUserByEmail,
  generateRandomString,
  getUserById,
  isDuplicateEmail,
  getClientUrls,
  checkPasswordValidity
};
