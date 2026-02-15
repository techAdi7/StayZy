const express = require("express");
const storeRouter = express.Router();
const storeController = require("../controllers/storeController");
// get requests
storeRouter.get("/", storeController.getIndex);
storeRouter.get("/booking", storeController.getBooking);
storeRouter.get("/favourite-list", storeController.getFavouriteList);
storeRouter.get("/airbnbHome-list", storeController.getHomesList);
storeRouter.get("/airbnbHome-list/:homeId" , storeController.getHomesDetails);
// post requests
storeRouter.post("/favourite-list", storeController.postAddToFavourite);
storeRouter.post("/favourite-list/delete/:homeId", storeController.postDeleteFromFavourite);
module.exports = storeRouter;
