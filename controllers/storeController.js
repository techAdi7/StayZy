const Home = require("../models/home");
const User = require("../models/user");

// get request handling
exports.getIndex = (req, res, next) => {
  console.log("Session Value : ", req.session, req.session.isLoggedIn);

  Home.find().then((data) => {
    res.render("store/index", {
      data: data,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomesList = (req, res, next) => {
  Home.find().then((data) => {
    res.render("store/airbnbHome-list", {
      data: data,
      pageTitle: "Home List",
      currentPage: "airbnbHome-list",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBooking = (req, res, next) => {
  res.render("store/booking", {
    pageTitle: "My Bookings",
    currentPage: "booking",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourite-list",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.getHomesDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("At home details page", homeId);

  // Check if homeId is a valid ObjectId
  if (!require("mongoose").Types.ObjectId.isValid(homeId)) {
    console.log("Invalid home ID");
    return res.redirect("/airbnbHome-list");
  }

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/airbnbHome-list");
    } else {
      console.log(home);
      res.render("store/home-details", {
        homeReg: home,
        pageTitle: "Home Detail",
        currentPage: "airbnbHome-list",
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

// post request handling
exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  // Check if homeId is NOT already in favourites by comparing _id
  const isFavourited = user.favourites.some(
    (fav) => fav._id.toString() === homeId,
  );
  if (!isFavourited) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourite-list");
};

exports.postDeleteFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  // Compare _id property since favourites contains objects after populate
  user.favourites = user.favourites.filter(
    (fav) => fav._id.toString() !== homeId,
  );
  await user.save();
  res.redirect("/favourite-list");
};
