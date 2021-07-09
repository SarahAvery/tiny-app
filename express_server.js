//
//............Requires
const {
  getUserByEmail,
  generateRandomString,
  getUserById,
  isDuplicateEmail,
  getClientUrls,
  checkPasswordValidity
} = require("./helpers");

//
//............SETUP............//
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
//............Middleware
var cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: ["lhl"]
  })
);

//
//............DATABASES............//
let urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "hThLlS" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "jsafiu" }
};

// *** bcrypt works on all new users, when registering -> This does not work on checking one hardcoded into the DB (Can register, logout, and log back in with bcrypt working)

let users = {
  hThLlS: {
    id: "hThLlS",
    email: "awd@awd",
    password: "purple-monkey-dinosaur"
  },
  jsafiu: {
    id: "jsafiu",
    email: "a@a",
    password: "orange-monkey-dinosaur"
  }
};

//--------------------------------//
app.get("/", (req, res) => {
  res.send("Hello!");
});

//
//............TEMPLATES............//
app.get("/urls", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  if (user) {
    const templateVars = { urls: getClientUrls(urlDatabase, user.id), user };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Please login or register first.");
  }
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUserById(req.session.user_id, users);

  if (user) {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("The requested page was not found.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`${longURL}`);
});

app.get("/register", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  const templateVars = { user };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  const templateVars = { user };
  res.render("login", templateVars);
});

//
//............POSTS............//

//
//............Generate randome string, add to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

//
//............Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("You are unauthorized to delete this link.");
  }
});

//
//............Edit and Update URL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  let userObj = getClientUrls(urlDatabase, userID);
  if (userObj[shortURL]) {
    res.redirect("/urls");
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else {
    res.status(400).send(`You don't have permissions to edit this link.`);
  }
});

//
//............Login Username
app.post("/login", (req, res) => {
  const errors = { email: "Email Not Found", password: `Incorrect Password` };
  const user = getUserByEmail(req.body.email, users); // returns user
  const loginPass = req.body.password; // pass entered on login
  // error
  if (!user) {
    res.status(403).render("login", { error: errors.email });
  }

  const passwordValid = checkPasswordValidity(user.password, loginPass);
  // error
  if (!passwordValid || passwordValid === undefined) {
    res.status(403).render("login", { error: errors.password });
  } else {
    // success
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

//
//............Logout Username
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//
//............Registration
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send(`You need to provide an Email and Password.`);
  }
  if (isDuplicateEmail(email, users)) {
    res.status(400).send(`That Email Address has already been registered.`);
  } else {
    users[userId] = {
      id: userId,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };

    req.session.user_id = userId;
    res.redirect("/urls");
  }
});
