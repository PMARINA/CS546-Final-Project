const express = require('express');
const router = new express.Router();
const Maintenance = require('../../models/machineModel');

router.get('/', async (req, res) => {
  res.json('all models');
});

router.delete('/deleteMachineModel/:id', async (req, res) => {
  const name = req.params.name;
  deleteMachineModel(name);
  res.json(`deleted the model with name: ${name}`);
});
router.post("/modifyMaintenance",function(req,res){
    var e = JSON.stringify(req.body.newdata);
    modifyMachineModel(e.name, e.cycles);
    res.send(`modified the model with name: ${e.name}`)
});


router.patch('/:id', async (req, res)=>{
  const modelId = req.params.id;
  res.json(`updated the model with id: ${modelId}`);
});

module.exports = router;
