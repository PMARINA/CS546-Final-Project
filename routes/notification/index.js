const express = require('express');
const router = express.Router();
const appointment = require('../../models/appointment')
const building=require('../../models/building')
const notify=require('../../data/notification')
const user=require('../../models/user')

router.post('/reset', async (req, res) => {
   try{
    await notify.reset(res.locals.userInfo.email)//user's email
    // send reset email to user   
   }catch(e){
       res.json(e)
   }
})

router.post('/', async (req, res) => {
    try{
     let newapm=appointment.findById(res.locals.userInfo._id);
     let buildings=building.findById(newapm.buildingId);
     let name;
     buildings.washers.forEach(element => {
         if(element.modelId==newapm.machineId) name=buildings.name+" washer "+element.name
     });
     buildings.dryers.forEach(element => {
        if(element.modelId==newapm.machineId) name=buildings.name+" dryer "+element.name
    });
     await notify.notification(name,newapm.startTimestamp,res.locals.userInfo.email)//appointment information,user's email
     // send appointment success email to user   
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