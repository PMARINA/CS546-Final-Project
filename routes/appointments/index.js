const express = require('express');
const router = new express.Router();
const Appointment = require('../../data/Appointment');

router.get('/', async (req, res) => {
  res.json('all appointments');
});

router.delete('/:id', async (req, res) => {
  const appointmentId = req.params.id;
  res.json(`deleted the appointment with id: ${appointmentId}`);
});

router.patch('/:id', async (req, res)=>{
  const appointmentId = req.params.id;
  res.json(`updated the appointment with id: ${appointmentId}`);
});

module.exports = router;
