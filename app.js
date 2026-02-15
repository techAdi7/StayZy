//  -> To test host and guest login

// 1. bhatt@gmail.com                // host credentials
//     Rameshbhatt@123
// 2. thakur@gmail.com              // guest credentials
//     Maheshthakur@123

// ======================================
// IMPORTING REQUIRED MODULES
// ======================================
const path = require("path");
const rootDir = path.dirname(require.main.filename);

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const DB_PATH =
  "mongodb+srv://Eatzo:Eatzo2952@clusterone.lvvroop.mongodb.net/airbnb?appName=ClusterOne";

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});
// ======================================
// INITIALIZING EXPRESS APP
// ======================================
const app = express();

// ======================================
// MIDDLEWARES (ORDER MATTERS A LOT)
// ======================================

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = {
  storage, fileFilter,
};
// Parse incoming form data
app.use(express.urlencoded({ extended: false }));
app.use(multer(multerOptions).single("photo")); // 'photo' is the name of the file input field in the form
// ======================================
// STATIC FILES
// ======================================
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/airbnbHome-list/uploads", express.static(path.join(rootDir, "uploads")));

// Parse cookies from browser
app.use(cookieParser());

// Session middleware
// This creates: req.session
app.use(
  session({
    secret: "airbnb project work",
    resave: false,
    saveUninitialized: true,
    store: store,
  }),
);

// ======================================
// SETTING VIEW ENGINE
// ======================================
app.set("view engine", "ejs");
app.set("views", "views");

// ======================================
// CUSTOM MIDDLEWARE
// (LOGIN STATUS CHECK)
// ======================================

// session based login
app.use((req, res, next) => {
  console.log("Session value:", req.session);
  req.session.isLoggedIn = !!req.session.isLoggedIn;
  console.log("Is Logged In:", req.session.isLoggedIn);
  next();
});

// ======================================
// IMPORTING ROUTES
// ======================================
const storeRouter = require("./routes/storeRouter");
const authRouter = require("./routes/authRouter");
const hostRouter = require("./routes/hostRouter");
const errorController = require("./controllers/404");

// ======================================
// ROUTES
// ======================================

// Public routes
app.use(storeRouter);
app.use(authRouter);

// Protected routes (host)
app.use("/host", (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", hostRouter);

// ======================================
// 404 PAGE
// ======================================
app.use(errorController.error404);

// ======================================
// DATABASE CONNECTION + SERVER START
// ======================================
const PORT = 4006;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });
