const express = require('express');
const router = express.Router();
const appointment = require('../../models/appointment')
const notify=require('../../data/notification')
const user=require('../../models/user')

router.post('/', async (req, res) => {
   try{
       let cancelappointment=[]
       appointment.forEach(element=>{
           if(element.machineId==machineId) cancelappointment.push(element.userId)
       })
       cancelappointment.forEach(cancel => {
           user.forEach(element=>{
               if(element._id==cancel) await notify.notification(element.email)
           })
       });
       
   }catch(e){
       res.json(e)
   }
})

router.get('/', async (req, res) => {
    try {
        res.render('function/notification');
      } catch (e) {
        res.status(500).send();
      }
    });
module.exports = router;