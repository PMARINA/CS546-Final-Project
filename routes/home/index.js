const express = require('express');
const User = require('../../data/User');
const router = new express.Router();
const expressHandlebars = require('express-handlebars').create();
const Appointment = require('../../data/Appointment');
const moment = require('moment');
const Building = require('../../models/building');
const cookieName = require('../../config.json').APPLICATION.COOKIE.name;

router.get('/', async (req, res) => {
  let userLoggedIn = false;
  if (req.session && req.session.userInfo) {
    const userId = req.session.userInfo['_id'];
    if (await User.exists(userId)) {
      // res.json({'redirect': '/'});
      // res.redirect('/');
      userLoggedIn = true;
    } else {
      res.redirect('/logout');
      return;
    }
  }
  let navbarUserInfo = undefined;
  if (userLoggedIn) {
    navbarUserInfo = {};
    navbarUserInfo.buildings = (await User.getAllBuildingsForUser(userId));
    for (let i = 0; i < navbarUserInfo.buildings.length; i++) {
      navbarUserInfo.buildings[i] = navbarUserInfo.buildings[i].toJSON();
    }
    console.log(navbarUserInfo);
  }
  const context = {
    userLoggedIn,
    currentPageIsHome: true,
    navbarUserInfo,
  };
  console.log(context);
  const navbar = await expressHandlebars.render('views/navbar/main.handlebars', context);
  if (userLoggedIn) {
    const nearbyAppointments = await Appointment.get(req.session.userInfo['_id'], moment().startOf('day').toDate());
    for (let i = 0; i < nearbyAppointments.length; i++) {
      const a = nearbyAppointments[i];
      a._id = a._id.toString();
      a.startDate = moment(a.startTimestamp).format('M/D - h:mm A').toString();
      a.endDate = moment(a.endTimestamp).format('M/D - h:mm A').toString();
      const building = (await Building.findOne(a.buildingId));
      a.building = building.name;
      for (let j = 0; j < building.washers.length && !a.machine; j++) {
        if (building.washers[j]._id.toString() === a.machineId.toString()) {
          a.machine = building.washers[j].name;
        }
      }
      for (let j = 0; j < building.driers.length && !a.machine; j++) {
        if (building.washers[j]._id.toString() === a.machineId.toString()) {
          a.machine = building.washers[j].name;
        }
      }
    }
    console.log(nearbyAppointments);
    res.render('homeLoggedIn', {
      navbar, title: 'Duck Wash', appointments: nearbyAppointments, allowedProtoProperties: {
        _id: true,
      },
    });
  } else {
    res.render('homeAnonymous', {navbar, title: 'Duck Wash'});
  }
});

module.exports = router;
