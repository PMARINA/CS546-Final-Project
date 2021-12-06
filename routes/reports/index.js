const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('all reports');
});

router.delete('/:id', async (req, res) => {
  const reportId = req.params.id;
  res.json(`deleted the report with id: ${reportId}`);
});

router.patch('/:id', async (req, res)=>{
  const reportId = req.params.id;
  res.json(`updated the report with id: ${reportId}`);
});

module.exports = router;
