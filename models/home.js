const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  homeName: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  photo: String,
  description: String,
});
// adding the pre-hook to make sure that ones a delete operation is performed on any of the home in the in the home model , it will automatically erase all it's traces from the remaining models.
// homeSchema.pre('findOneAndDelete' , async function(next){
//  const homeId = this.getQuery()["_id"];
//  await Favourite.deleteMany({homeId:homeId});
//  next();
// });
module.exports = mongoose.model("Home", homeSchema);
/**
 *  save()
 *  find()
 *  findById(homeId)
 *  deleteById(homeId)
 **/
// const homeDataPath = path.join(rootDir, "data", "home.json");
