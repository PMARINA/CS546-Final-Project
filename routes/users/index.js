const express = require('express');
const router = new express.Router();

router.get('/', async (req, res) => {
  res.json('all users');
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  res.json(`deleted the user with id: ${userId}`);
});

router.patch('/:id', async (req, res)=>{
  const userId = req.params.id;
  res.json(`updated the user with id: ${userId}`);
});

module.exports = router;
