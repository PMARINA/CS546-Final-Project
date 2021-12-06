const express = require('express');
const router = new express.Router();
const Maintenance = require('../../models/maintenance');

router.get('/', async (req, res) => {
  res.json('all models');
});

router.delete('/deleteMaintenance/:id', async (req, res) => {
  const modelId = req.params.id;
  deleteMaintenace(modelId);
  res.json(`deleted the model with id: ${modelId}`);
});
router.post("/modifyMaintenance",function(req,res){
    var e = JSON.stringify(req.body.newdata);
    modifyMaintenance(e.startDate, e.endDate, e.machineId, e.note);
    res.send(`modified the model with id: ${e.modelId}`)
});


router.patch('/:id', async (req, res)=>{
  const modelId = req.params.id;
  res.json(`updated the model with id: ${modelId}`);
});

module.exports = router;
