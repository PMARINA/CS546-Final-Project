(function ($) {
  const buildingAppt = $("select[name='apptBuilding']");
  const apptWasherDropdown = $('#whichWasher');
  const apptDryerDropdown = $('#whichDryer');
  const washerTime = $('#washerTime');
  const washerCycle = $('#washerCycle');
  const dryerTime = $('#dryerTime');
  const dryerCycle = $('#dryerCycle');
  const deleteButton = $("#deleteButton");
  const messageBody = $("#availBody");
  /**
     * Grab washer time and populate dryer start time
     */
  function setDryerTime() {
    const washStartTime = washerTime.val();
    const cycleTime = washerCycle.val();
    let minutes = parseInt(washStartTime.slice(3)) + parseInt(cycleTime);
    let newTime = '';
    let newMinutes = '';
    if(minutes >= 60 ){
      
      if(minutes >= 120){
        newMinutes = (minutes-120).toString()
        newTime = (parseInt(washStartTime.slice(0,2)) + 2).toString() + ":" + newMinutes;
      }else{
        newMinutes = (minutes-60).toString();
        newTime = (parseInt(washStartTime.slice(0,2)) + 1).toString() + ":" + newMinutes;
      }
    }
    else{
      newTime = (parseInt(washStartTime.slice(0,2))).toString() + ":" + (minutes).toString();
    }
    // pad with leading zeros if necessary
    if(newTime[1] !== ":"){
      // check if appointment runs into next day
      const hours = parseInt(newTime.slice(0,2))
      if(hours == 24){
        newTime = "00:" + newMinutes;
      }
      else if(hours > 25){
        newTime = (hours - 24).toString() + ":" + newMinutes;
      }
    }
    else if(newTime[1] === ":"){
      newTime = "0" + newTime;
    }
    if(newTime.length < 5){
      newTime = newTime.slice(0,3) + "0" + newTime[newTime.length-1];
    }
    // set new time
    dryerTime.val(newTime);
  }
  /**
     * Render only washer
     */
   function getAndRenderWashingMachines() {
    const selectedBuilding = buildingAppt.val();
    if (!selectedBuilding) return; // No building available;
    renderWasherDriersAppointments(selectedBuilding, 'washer');
  }

  /**
   * Render only dryers
   */
   function getAndRenderDryingMachines() {
    const selectedBuilding = buildingAppt.val();
    if (!selectedBuilding) return; // No building available;
    renderWasherDriersAppointments(selectedBuilding, 'drier');
    
  }

  /**
   * @param {String} selectedBuildingId ObjectId
   * @param {('washer'|'drier'|undefined)} whichOne Should we render washers or driers
   */
   function renderWasherDriersAppointments(selectedBuildingId, whichOne) {
    try {
      $.get(`/web/buildings/${selectedBuildingId}/${whichOne}`).done(
        function (data) {
          if (data.redirect !== undefined) {
            window.location.redirect(data.redirect);
          }
          // Render the machines in the dropdown
          let dropdown = '' 
          if(whichOne === 'washer'){
            dropdown = apptWasherDropdown;
          }
          else{
            dropdown = apptDryerDropdown;
          }
        
          dropdown.empty();
          data.forEach((d) =>
            dropdown.append($(`<option value="${d._id}">${d.name}</option>`))
          );
        }
      );
    } catch (e) {
      console.log(e);
    }
  }

  // form validation for appointments
  $("#apptForm").submit(function (event) {
    $("#errorBody").hide();
    // check appt building
    if($("#apptBuilding").val() === ""){
      event.preventDefault();
      $("#errorBody").text("Must select a building");
      $("#errorBody").show();
    }
    else{
      // check valid date
      const today = new Date();
      if(!$("#apptDate").val()){
        event.preventDefault();
        $("#errorBody").text("Invalid Date");
        $("#errorBody").show();
      }
      else{
        // check valid time
        if(!$("#washerTime").val()){
          event.preventDefault();
          $("#errorBody").text("Invalid Time");
          $("#errorBody").show();
        }
        else{
          const calendarVal = new Date(
            $("#apptDate").val() + "T" + $("#washerTime").val()
          );
          if (calendarVal < today) {
            event.preventDefault();
            $("#errorBody").text("Appointments can not be made in the past.");
            $("#errorBody").show();
          }
        }
      }
    }
  });
  // for appointment page only
  buildingAppt.on("change", getAndRenderWashingMachines);
  buildingAppt.on("change", getAndRenderDryingMachines);
  // buildingAppt.on("change", getAvailability);
  washerTime.on("change", setDryerTime);
  washerCycle.on("change", setDryerTime);
  deleteButton.on("click", function(event) {
      event.preventDefault();
      $('#apptAvail').hide();
  });
})(window.jQuery);
