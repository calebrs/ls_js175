const express = require("express");
const app = express();

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("hello-world-english");
});

app.listen(3001, "localhost", () => {
  console.log("Listening to port 3001.");
});