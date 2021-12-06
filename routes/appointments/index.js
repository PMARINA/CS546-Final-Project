const express = require('express');
const router = new express.Router();
const Appointment = require('../../data/Appointment');

router.get('/', async (req, res) => {
  const buildingsWithAccessGroups = await Building.find({accessGroup: {$in: accessGroups}});
  const results = [];
  for (let i = 0; i < buildingsWithAccessGroups.length; i++) {
    const building = buildingsWithAccessGroups[i];
    const newObj = {};
    newObj._id = building._id.toString();
    newObj.name = building.name.toString();
    results.push(newObj);
  }
  res.render('appointments', {buildings: results});
});

router.post('/', async (req, res) => {
  console.log("here");
  console.log(res.body);
  res.json('posted appointment form');
})
router.delete('/:id', async (req, res) => {
  const appointmentId = req.params.id;
  res.json(`deleted the appointment with id: ${appointmentId}`);
});

router.patch('/:id', async (req, res)=>{
  const appointmentId = req.params.id;
  res.json(`updated the appointment with id: ${appointmentId}`);
});

module.exports = router;
