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

//
//............SETUP............//
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
//............Middleware
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());

// app.use(express.urlencoded());

//
//............Style
// app.use(express.static("public"));

//
//............DATABASES............//
let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  hThLlS: {
    id: "hThLlS",
    email: "awd@awd",
    password: "awd"
  }
};

// "userRandomID": {
//   id: "userRandomID",
//   email: "user@example.com",
//   password: "purple-monkey-dinosaur"
// },
// "user2RandomID": {
//   id: "user2RandomID",
//   email: "user2@example.com",
//   password: "dishwasher-funk"
// }

function getUserById(userId) {
  return users[userId];
}

function isDuplicateEmail(email) {
  return Object.keys(users).some((key) => users[key].email === email);
}

//--------------------------------//
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/shortURL.json", (req, res) => {
  res.json(urlDatabase);
});

//
//............TEMPLATES............//
app.get("/urls", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  const templateVars = { urls: urlDatabase, user };
  console.log(users);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  const templateVars = { user };
  res.render("register", templateVars);
});

//
//............Generate randome string, add to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = `${longURL}`;
});

//
//............Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//
//............Edit and Update URL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//
//............Login Username
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

//
//............Logout Username
app.post("/logout", (req, res) => {
  // clear username
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls");
});

//
//............Registration
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(users);

  console.log(req.body.email, req.body.password);

  if (!email || !password) {
    res.status(400).send(`You need to provide an Email and Password.`);
  }
  if (isDuplicateEmail(email)) {
    res.status(400).send(`That Email Address has already been registered.`);
  } else {
    const user = { id: userId, email: email, password: password };
    users[userId] = user;

    res.cookie("user_id", userId);
    res.redirect("/urls");
  }
});
