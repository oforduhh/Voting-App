const express = require("express");
const indexRouter = require("./routes/indexRouter");
const userRouter = require("./routes/usersRouter");
const expressLayouts = require("express-ejs-layouts");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/passport")(passport);
const pusher = require("pusher");
const cors = require("cors");
const path = require("path");

// importing the Database
const { MongoURI } = require("./config/keys");

// initializing our app
const app = express();

// Enable Cross Origin Resource Sharing
app.use(cors());

// Set up a public folder
app.use(express.static(path.join(__dirname, "public")));

// bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Connect to the Database
mongoose
  .connect(MongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Database is connected`);
  })
  .catch((err) => {
    console.log(err);
  });

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Routes
app.use("/", indexRouter);
app.use("/users", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
