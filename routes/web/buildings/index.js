const express = require('express');
const router = new express.Router();
const middleware = require('../../middleware');
const User = require('../../../models/user');
const Building = require('../../../models/building');

router.get('/', middleware.auth.apiLoggedInOnly, async (req, res) => {
  const userObject = await User.findById(req.userId);
  const accessGroups = userObject.accessGroups;
  const buildingsWithAccessGroups = await Building.find({accessGroup: {$in: accessGroups}});
  const results = [];
  for (let i = 0; i < buildingsWithAccessGroups.length; i++) {
    const building = buildingsWithAccessGroups[i];
    const newObj = {};
    newObj._id = building._id.toString();
    newObj.name = building.name.toString();
    results.push(newObj);
  }
  res.json(results);
});

router.get('/:id/:type', middleware.auth.apiLoggedInOnly, async (req, res) => {
  const buildingId = req.params['id'];
  const machineType = req.params['type'] + 's';
  const userObject = await User.findById(req.userId);
  const accessGroups = userObject.accessGroups;
  const building = await Building.findOne({accessGroup: {$in: accessGroups}, _id: buildingId});
  if (!building) res.json({redirect: '/reports/new'}); // An issue with access... just reload the form in case something is wonky
  else {
    res.json(building[machineType]);
    console.log(building[machineType]);
  }
  console.log(`Building ID: ${buildingId}`);
  console.log(`Machine Type: ${machineType}`);
});
module.exports = router;
