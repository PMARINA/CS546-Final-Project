const express = require("express");
const router = new express.Router();
const Appointment = require("../../data/Appointment");
const middleware = require("../middleware");

router.use(middleware.auth.loggedInOnly);

router.get("/", async (req, res) => {
  const accessGroups = req.userData.accessGroups;
  const buildingsWithAccessGroups = await Building.find({
    accessGroups: { $in: accessGroups },
  });
  const results = [];
  for (let i = 0; i < buildingsWithAccessGroups.length; i++) {
    const building = buildingsWithAccessGroups[i];
    const newObj = {};
    newObj._id = building._id.toString();
    newObj.name = building.name.toString();
    results.push(newObj);
  }
  res.render("appointments", { buildings: results, navbar: req.navbar });
});

router.post("/", async (req, res) => {
  res.json("posted appointment form");
});
router.delete("/:id", async (req, res) => {
  const appointmentId = req.params.id;
  res.json(`deleted the appointment with id: ${appointmentId}`);
});

router.patch("/:id", async (req, res) => {
  const appointmentId = req.params.id;
  res.json(`updated the appointment with id: ${appointmentId}`);
});

module.exports = router;
