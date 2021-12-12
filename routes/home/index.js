const express = require("express");
const User = require("../../data/User");
const router = new express.Router();
const Appointment = require("../../data/Appointment");
const moment = require("moment");
const Building = require("../../models/building");
const cookieName = require("../../config.json").APPLICATION.COOKIE.name;
const auth = require("../middleware").auth;
const navbar = require("../middleware").navbar;

router.get("/", async (req, res) => {
  if (res.locals.loggedIn) {
    if (!res.locals.userValidated) {
      res.redirect("/logout"); // User account is deleted (by admin for ex) while user logged in
      return;
    }
  }

  if (res.locals.userValidated) {
    const nearbyAppointments = await Appointment.get(
      res.locals.userId,
      moment().startOf("day").toDate()
    );
    for (let i = 0; i < nearbyAppointments.length; i++) {
      const a = nearbyAppointments[i];
      a._id = a._id.toString();
      a.startDate = moment(a.startTimestamp).format("M/D - h:mm A").toString();
      a.endDate = moment(a.endTimestamp).format("M/D - h:mm A").toString();
      const building = await Building.findOne(a.buildingId);
      a.building = building.name;
      for (let j = 0; j < building.washers.length && !a.machine; j++) {
        if (building.washers[j]._id.toString() === a.machineId.toString()) {
          a.machine = building.washers[j].name;
          a.machineType = "washer";
        }
      }
      for (let j = 0; j < building.driers.length && !a.machine; j++) {
        if (building.driers[j]._id.toString() === a.machineId.toString()) {
          a.machine = building.driers[j].name;
          a.machineType = "drier";
        }
      }
    }
    res.render("homeLoggedIn", {
      navbar: res.locals.navbar,
      title: "Duck Wash",
      appointments: nearbyAppointments,
      allowedProtoProperties: {
        _id: true,
      },
    });
  } else {
    res.render("homeAnonymous", {
      navbar: res.locals.navbar,
      title: "Duck Wash",
    });
  }
});

module.exports = router;
