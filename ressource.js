const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const PORT = 8081;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

let users = {};
const tokens = {};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.post("/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Fields must be defined and not empty.");
  }
  if (users[username]) {
    return res.status(400).send("Username is already taken.");
  }
  users[username] = password;
  res.status(201).send(`User ${username} has been created.`);
});

app.get("/login", (req, res) => {
  if (req.cookies.user_token && tokens[req.cookies.user_token]) {
    return res.redirect("/profile");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] === password) {
    const token = uuidv4();
    tokens[token] = username;

    res.cookie("user_token", token, {
      httpOnly: true,
    });
    return res.status(200).send({ message: "Login successful" });
  } else {
    return res.sendStatus(401);
  }
});

app.get("/profile", (req, res) => {
  const token = req.cookies.user_token;

  if (token && tokens[token]) {
    res.render("profile", { username: tokens[token] });
  } else {
    res.redirect("/login");
  }
});
