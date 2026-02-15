const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    editing: false,
    oldInput: { email: "" },
    errors: [],
    oldInput: { email: "" },
    isLoggedIn: req.session.isLoggedIn,
    user: {},
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User Does not exist"],
      oldInput: { email },
      user: {},
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: { email },
      user: {},
    });
  }
  req.session.isLoggedIn = true;
  // Store user with userType for nav.ejs to properly differentiate guest/host
  req.session.user = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType, // IMPORTANT: This is used by nav.ejs to show different navigation
  };
  await req.session.save();

  // REDIRECT BASED ON USER TYPE
  if (user.userType === "host") {
    res.redirect("/host/host-airbnbHome-list");
  } else {
    res.redirect("/airbnbHome-list");
  }
};

// post logout feature
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "", userType: "" },
    user: {},
  });
};

// We are going to pass the array of middleware to the postSignup
// All the Required validators are imported from express-validator package that we can use and apply on our server side.
const { check, validationResult } = require("express-validator");
exports.postSignup = [
  // first name validation
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First name must contain only letters"),

  // last name validation
  check("lastName")
    .matches(/^[A-Za-z]*$/) // + -> minimum 1 character, * -> can be empty means 0 or more characters.
    // we dont check not Empty , trim or length for last name as it is optional.
    .withMessage("Last name must contain only letters"),

  // email validation
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // password validation
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character")
    .trim(),

  // confirm password validation
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password does not match password");
      }
      return true;
    }),

  // user type validation
  check("userType")
    .notEmpty()
    .withMessage("User type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  // Terms Accepted validation
  check("termsAccepted")
    .notEmpty()
    .withMessage("You must accept the terms and conditions")
    .custom((value) => {
      if (value !== "on") {
        throw new Error("You must accept the terms and conditions");
      }
      return true;
    }),

  // final handler middleware
  (req, res, next) => {
    const { firstName, lastName, email, password, userType, termsAccepted } =
      req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: {},
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        console.log("Password hashed successfully");
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
          termsAccepted: termsAccepted === "on" ? true : false,
        });
        console.log("Saving user to database...");
        return user.save();
      })
      .then((savedUser) => {
        console.log("User saved successfully, redirecting to /login");
        res.redirect("/login");
      })
      .catch((err) => {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: [err.message],
          oldInput: { firstName, lastName, email, password, userType },
          user: {},
        });
      });
  },
];
