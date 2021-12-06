window.jQuery.noConflict();
(($) => {
  $(function (events, handler) {

    // HTML DOM Elements
    const buildingSelection = $('select[name=\'building\']');
    const washerRadioElement = $('#washer');
    const whichSpecificMachineDropdown = $('#whichMachine');
    const machineCategorySelection = $('input[name=\'machineType\']');
    const reportType = $('input[name=\'reportType\']');

    /**
     * Is the user reporting a building or a machine
     * @return {('building'|'machine'|undefined)} String
     */
    function getCurrentlySelectedOptionBuildingMachine() {
      return $('input[name=\'reportType\']:checked').val();
    }

    /**
     *
     * @return {('washer'|'drier'|undefined)}
     */
    function getCurrentlySelectedOptionWasherDrier() {
      return $('input[name=\'machineType\']:checked').val();
    }

    /**
     * Determine if we need the user to specify what kind of machine and which machine they're reporting
     * Change the visibility of corresponding form elements
     */
    function autoShowAllMachineOptions() {
      const machineTypeField = washerRadioElement.parent().parent().parent();
      const whichMachineField = whichSpecificMachineDropdown.parent().parent().parent();
      const selectedOption = getCurrentlySelectedOptionBuildingMachine();
      if (selectedOption !== 'machine') {
        machineTypeField.hide();
        whichMachineField.hide();
      } else {
        machineTypeField.show();
        // whichMachineField.show();
      }
    }

    /**
     * Determine if we need to render the list of machines. If so, outsource to `renderWasherDriers()`
     */
    function getAndRenderMachines() {
      const selectedBuilding = buildingSelection.val();
      if (!selectedBuilding) return; // No building available;
      const c = getCurrentlySelectedOptionBuildingMachine();
      if (c === undefined || c === 'building') return; // No need to find list of machines if not reporting a machine
      const wd = getCurrentlySelectedOptionWasherDrier();
      if (wd === undefined) return; // Why render everything when the user still has to fill out the above part of the form?
      renderWasherDriers(selectedBuilding, wd);
    }

    /**
     * @param {String} selectedBuildingId ObjectId
     * @param {('washer'|'drier'|undefined)} whichOne Should we render washers or driers
     */
    function renderWasherDriers(selectedBuildingId, whichOne) {
      try {
        $.get(`/web/buildings/${selectedBuildingId}/${whichOne}`).done(function (data) {
          console.log(data);
          if (data.redirect !== undefined) {
            window.location.redirect(data.redirect);
          }
          // Render the machines in the dropdown
          const dropdown = whichSpecificMachineDropdown;
          dropdown.empty();
          data.forEach((d) => dropdown.append($(`<option value="${d._id}">${d.name}</option>`)));
          // Now show the rendered list
          const whichMachineField = dropdown.parent().parent().parent();
          whichMachineField.show();
        });
      } catch (e) {
        console.log(e);
      }
    }

    function populateBuildingsIntoForm() {
      try {
        $.get('/web/buildings').done(function (data) {
          console.log(data);
          if (!data) return;
          if (typeof data === 'object' && data.redirect) window.location.redirect(data.redirect);
          if (!Array.isArray(data)) return;
          for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            const newElement = `<option value="${obj._id}">${obj.name}</option>`;
            console.log(newElement);
            buildingSelection.append(newElement);
          }
        });
      } catch (e) {
        console.log("Error attempting to populate the form with buildings: ")
        console.log(e);
      }
    }

    populateBuildingsIntoForm();

    autoShowAllMachineOptions();
    reportType.each(function () {
      $(this).on('change', autoShowAllMachineOptions);
    });
    machineCategorySelection.on('change', getAndRenderMachines);
    buildingSelection.on('change', getAndRenderMachines);
  });
})(window.jQuery);
