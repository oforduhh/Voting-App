const express = require("express");
const indexRouter = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
indexRouter.get("/", forwardAuthenticated, (req, res) => {
  res.render("welcome");
});
indexRouter.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.statusCode = 200;
  res.render("dashboard", {
    user: req.user,
  });
});

indexRouter.get("/chart", ensureAuthenticated, (req, res) => {
  res.render("chart", {
    user: req.user,
  });
});

module.exports = indexRouter;
