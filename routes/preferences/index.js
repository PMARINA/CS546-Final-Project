const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('Settings Page');
});

router.patch('/', async (req, res)=>{
  const reportId = req.params.id;
  res.json(`updated the user's personal preferences: ${reportId}`);
});

module.exports = router;
