const express = require("express");
const router = new express.Router();
const Appointment = require("../../models/appointment.js");
const AppointmentData = require("../../data/Appointment");
const Maintenance = require("../../models/maintenance.js");
const middleware = require("../middleware");
const scripts = [{ script: '/js/appointments/calendar.js' }];
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

router.use(middleware.auth.loggedInOnly);

router.get("/", async (req, res) => {
  // buildings available to user
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
  // times available 
  const appts = await Appointment.find({}).lean();
  res.render("appointments", { buildings: results, navbar: req.navbar, scripts:scripts, appts: appts  });
});

router.post("/", async (req, res) => {
  console.log(req.body);
  let success = false;
  // get date and time
  const startWashTime = moment(req.body.apptDate + " " + req.body.washerTime);
  const endWashTime = moment(req.body.apptDate + " " + req.body.washerTime).add(parseInt(req.body.washerCycle), 'minutes');
  // add washer cycle time
  // endWashTime.add(parseInt(req.body.washerCycle), 'minutes');
  // dryer cycle
  const startDryTime = moment(endWashTime.format('YYYY-MM-DD') + " " + req.body.dryerTime);
  const endDryTime = moment(startDryTime.format('YYYY-MM-DD') + " " + req.body.dryerTime).add(parseInt(req.body.dryerCycle), 'minutes');
  // get cycle id
  // SINGLE MODEL ASSUMPTION
  let washerCycleId, dryerCycleId = "";
  if(req.body.washerCycle === '15'){
    washerCycleId = '61b41214f9884e76acf74275';
  }else if(req.body.washerCycle === '45'){
    washerCycleId = '61b41214f9884e76acf74276';
  }else if(req.body.washerCycle === '70'){
    washerCycleId = '61b41214f9884e76acf74277';
  }
  if(req.body.dryerCycle === '15'){
    dryerCycleId = '61b41214f9884e76acf74275';
  }else if(req.body.dryerCycle === '45'){
    dryerCycleId = '61b41214f9884e76acf74276';
  }else if(req.body.dryerCycle === '70'){
    dryerCycleId = '61b41214f9884e76acf74277';
  }
  // check appt time
  const maintenanceData = Maintenance.find({});
  const apptRange = moment.range([startWashTime, endDryTime]);
  console.log(apptRange);
  const appts = await Appointment.find({}).lean();
  for(let i=0; i<appts.length; i++){
    // check overlapping appointments
    if((appts[i].machineId.toString() === req.body.whichWasher || appts[i].machineId.toString() === req.body.whichDryer) && appts[i].buildingId.toString() === req.body.apptBuilding){
      const range = moment.range([moment(appts[i].startTimestamp), moment(appts[i].endTimestamp)]);
      if (apptRange.overlaps(range)){
        success = false;
        res.render("apptOutcome", { navbar: req.navbar, success: success, message:"Appointment times conflict. Please make a new appointment." });
        return;
      }
    // check if machine is in maintenance
    for(let j=0; j<maintenanceData.length; j++){
      const maintenanceRange = moment.range([maintenanceData[j].startDate, maintenanceData[j].endDate]);
      if (apptRange.overlaps(maintenanceRange)){
        success = false;
        res.render("apptOutcome", { navbar: req.navbar, success: success, message:"Machine is under maintenance during appointment time. Please make a new appointment." });
        return;
      }
    }
    }
  }
  // make appointments
  try{
    const newWashAppt = await AppointmentData.create(req.body.apptBuilding, req.userId, req.body.whichWasher, washerCycleId, startWashTime, endWashTime )
    const newDryAppt = await AppointmentData.create(req.body.apptBuilding, req.userId, req.body.whichDryer, dryerCycleId, startDryTime, endDryTime )
  }catch(e){
    console.log(e);
  }
  success = true;
  res.render("apptOutcome", { navbar: req.navbar, success: success, message: "Appointment Successfully Created" });
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
