const express = require('express');
const router = new express.Router();
const Building = require('../../data/Building');

router.get('/', async (req, res) => {
  res.json('all buildings');
});

router.get('/listOfAccessGroups', async (req, res)=>{
  const accessGroups = await Building.getAllAccessGroups();
  res.json(accessGroups);
});

router.delete('/:id', async (req, res) => {
  const buildingId = req.params.id;
  res.json(`deleted the building with id: ${buildingId}`);
});

router.patch('/:id', async (req, res)=>{
  const buildingId = req.params.id;
  res.json(`updated the building with id: ${buildingId}`);
});

module.exports = router;
