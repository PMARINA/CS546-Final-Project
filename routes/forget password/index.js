const express = require('express');
const router = express.Router();
const appointment = require('../../models/appointment')
const building=require('../../models/building')
const notify=require('../../data/notification')
const user=require('../../models/user')

router.post('/', async (req, res) => {
   try{
    await notify.reset(res.locals.userInfo.email)//user's email
    // send reset email to user   
   }catch(e){
       res.json(e)
   }
})
module.exports = router;