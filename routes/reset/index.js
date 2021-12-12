const express = require('express');
const router = express.Router();
const appointment = require('../../models/appointment')
const notify=require('../../data/notification')
const user=require('../../data/User')

router.post('/', async (req, res) => {
    try{
        if(!req.body.username||!req.body.password) throw"username or password isn't input"
        user.modifyUser(res.locals.userInfo._id,)
      }catch(e){
        res.status(400)
      }
  });

router.get('/', async (req, res) => {
    try {
        res.render('function/reset');
      } catch (e) {
        res.status(500).send();
      }
    });
module.exports = router;