const express = require("express");
const router = new express.Router();
const middleware = require("../../middleware");
const Appointment = require("../../../models/appointment");

router.post("/:id", middleware.auth.apiLoggedInOnly, async (req, res) => {
    try{
        const deleted = await Appointment.deleteOne({"_id":req.params.id});
        return deleted;
    }catch(e){
        console.log(e);
    }
});

module.exports = router;