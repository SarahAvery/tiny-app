const {
  getUserByEmail,
  generateRandomString,
  getUserById,
  isDuplicateEmail,
  getClientUrls,
  checkPasswordValidity
} = require("./helpers");

//............Setup............//

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

//............Middleware
const cookieSession = require("cookie-session");
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

//............Databases............//
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "hThLlS" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "jsafiu" }
};

const users = {
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

//............Get Requests............//
app.get("/", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const errors = { login: "Please login or register first." };
  const user = getUserById(req.session.user_id, users);
  if (user) {
    const userDB = getClientUrls(urlDatabase, user.id);
    const templateVars = { urls: userDB, user };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).render("login", { error: errors.login });
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
  const userDB = getClientUrls(urlDatabase, user.id);
  const shortURL = req.params.shortURL;
  console.log(userDB);

  if (!userDB[shortURL] || !user) {
    res.status(404).send("Access Denied.");
  } else if (user) {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(`${longURL}`);
  } else {
    const errors = "This short URL does not exist.";
    res.status(404).send(errors);
  }
});

app.get("/register", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

//............Post Requests............//

//............Generate randome string, add to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;

  if (userID && userID === urlDatabase[shortURL].userID) {
    longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errors = "Unauthorized Request";
    res.status(404).send(errors);
  }
});

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

//............Edit and Update URL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userObj = getClientUrls(urlDatabase, userID);
  if (userObj[shortURL]) {
    res.redirect("/urls");
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else {
    res.status(400).send(`You don't have permissions to edit this link.`);
  }
});

//............Login Username
app.post("/login", (req, res) => {
  const errors = { email: "Email Not Found", password: `Incorrect Password` };
  const user = getUserByEmail(req.body.email, users);
  const loginPass = req.body.password;
  if (!user) {
    res.status(403).render("login", { error: errors.email });
  }

  const passwordValid = checkPasswordValidity(user.password, loginPass);
  if (!passwordValid || passwordValid === undefined) {
    res.status(403).render("login", { error: errors.password });
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

//............Logout Username
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//............Registration
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const { email, password } = req.body;
  const errors = {
    duplicateEmail: "That Email Address has already been registered.",
    noEmailPass: `You need to provide an Email and Password.`
  };

  if (!email || !password || (email && !password) || (!email && password)) {
    res.status(403).render("register", { error: errors.noEmailPass });
  } else if (isDuplicateEmail(email, users)) {
    res.status(403).render("register", { error: errors.duplicateEmail });
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

//............Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
