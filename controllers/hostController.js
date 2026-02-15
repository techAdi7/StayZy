const Home = require("../models/home");
const fs = require("fs");
// get handlers
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home",
    currentPage: "add-home",
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  // by default both stores as string
  const homeId = req.params.homeId;
  // now gets converted to string
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found");
      return res.redirect("/host/host-airbnbHome-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your home",
      currentPage: "host-airbnbHome-list",
      editing: true,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.getHostHomesList = (req, res, next) => {
  Home.find().then((data) => {
    res.render("host/host-airbnbHome-list", {
      data: data,
      pageTitle: "Host Home List",
      currentPage: "host-airbnbHome-list",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

// post handlers

// ...existing code...
exports.postAddHome = async (req, res, next) => {
  try {
    console.log(req.file);
    console.log(req.body);
    const { homeName, pricePerNight, location, rating, description } = req.body;
    console.log(homeName, pricePerNight, location, rating, description);

    const photo = req.file.path;
    if (!req.file) {
      // console.log("No image provided");
      // return res.redirect("/host/add-home");
      return res.status(422).send("No image provided");
    }

    // This Home model expects the pre-build object not saparate fields.
    const home = new Home({
      homeName,
      pricePerNight,
      location,
      rating,
      photo,
      description,
    });
    await home.save();
    console.log("Home saved successfully");
    return res.redirect("/host/host-airbnbHome-list");
  } catch (err) {
    console.error("Error saving home:", err);
    return res.redirect("/host/host-airbnbHome-list");
  }
};

exports.postEditHome = async (req, res, next) => {
  const { id, homeName, pricePerNight, location, rating, description } =
    req.body;

  Home.findById(id).then((home) => {
    home.homeName = homeName;
    home.pricePerNight = pricePerNight;
    home.location = location;
    home.rating = rating;
    home.description = description;

    if (req.file) {
      fs.unlink(home.photo, (err) => {
        if (err) {
          console.error("Error deleting old photo:", err);
        } else {
          console.log("Old photo deleted successfully");
        }
      });
      home.photo = req.file.path;
    }

    home
      .save()
      .then((result) => {
        console.log("Home Updated : ", result);
      })
      .catch((err) => {
        console.log("Error while updating : ", err);
      });
    res.redirect("/host/host-airbnbHome-list");
  });
};

exports.postDeleteHome = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    console.log("Id of home to be deleted : ", homeId);
    // Ensure your Home.deleteById returns a Promise
    await Home.findByIdAndDelete(homeId);
    return res.redirect("/host/host-airbnbHome-list");
  } catch (err) {
    console.error("Error while deleting home", err);
    return res.redirect("/host/host-airbnbHome-list");
  }
};
// ...existing code...
