const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('all buildings');
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
