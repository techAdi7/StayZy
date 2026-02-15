const express = require("express");
const hostController = require("../controllers/hostController");
const hostRouter = express.Router();
// get routing
hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.get("/host-airbnbHome-list", hostController.getHostHomesList);
// --- add these two routes for edit ---
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", hostController.postEditHome);
// post routing
hostRouter.post("/add-home", hostController.postAddHome);
hostRouter.post("/delete-home/:homeId" , hostController.postDeleteHome);
module.exports = hostRouter;
