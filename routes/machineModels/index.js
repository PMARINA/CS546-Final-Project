const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('all models');
});

router.delete('/:id', async (req, res) => {
  const modelId = req.params.id;
  res.json(`deleted the model with id: ${modelId}`);
});

router.patch('/:id', async (req, res)=>{
  const modelId = req.params.id;
  res.json(`updated the model with id: ${modelId}`);
});

module.exports = router;
