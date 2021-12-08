const express = require('express');
const router = express.Router();
const appointment = require('../../models/appointment')
const machine=require('../../models/machineModel')


router.post('/', async (req, res) => {
   const name=machine.find({"_id":appointment.machineId}).name;
    const mailOptions = {
            from: 'YOUR EMAIL',
            to: req.session.email,//user's email
            subject: `Appointment successful`,
            html:`Your appointment is <h1>Time: ${appointment.startTimestamp} Machine: ${name}</h1>`
        };
        transporter.sendMail(mailOptions, (error, data) => {
            if (error) {
                console.log(error)
            }
        });
    })
module.exports = router;