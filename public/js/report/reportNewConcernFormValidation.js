window.jQuery.noConflict();
(($) => {
  $(function (events, handler) {

    // HTML DOM Elements
    const buildingHelpText = $('#buildingHelpText');
    const buildingSelection = $('select[name=\'building\']');
    const washerRadioElement = $('#washer');
    const whichSpecificMachineDropdown = $('#whichMachine');
    const machineCategorySelection = $('input[name=\'machineType\']');
    const reportType = $('input[name=\'reportType\']');
    const complaintField = $('#complaint');
    const form = $('#newReportForm');

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
     * Get the currently selected machine the user wants to complain about
     * @return {String}
     */
    function getCurrentlySelectedMachineId() {
      return $('input[name=\'machineModel\']:selected').val();
    }


    /**
     * Get the complaint
     * @return {String}
     */
    function getComplaint() {
      return complaintField.val();
    }

    /**
     * Get currently selected report severity
     * @return {String}
     */
    function getSeverity() {
      return $("input[name='severity']:selected").val();
    }

    /**
     * Get the currently selected building
     * @return {String}
     */
    function getSelectedBuilding() {
      return buildingSelection.val();
    }

    /**
     * Ensure the selected building is valid
     * @return {Boolean}
     */
    function validateBuilding() {
      const selectedBuilding = getSelectedBuilding();
      if (!selectedBuilding) {
        buildingHelpText.text('You must select a building. If none are available, then you do not have access to any buildings.');
        buildingSelection.addClass('is-danger');
      } else {
        buildingSelection.removeClass('is-danger');
        buildingHelpText.hide();
      }
      return !!(selectedBuilding);
    }

    /**
     * Validate the form
     * Render help text
     * Return whether everything was valid or not
     * @return {Boolean}
     */
    function validateForm() {
      let valid = true;
      valid = validateBuilding() && valid;
      valid = validateReportCategory() && valid;
      if (getCurrentlySelectedOptionBuildingMachine() === 'machine') {
        valid = validateMachineType() && valid;
        valid = validateWhichMachine() && valid;
      }
      valid = validateComplaint() && valid;
      valid = validateSeverity() && valid;
      return valid;
    }

    /**
     * Handle form submission events
     */
    function processFormSubmit(e) {
      e.preventDefault();
      if (validateForm()) {
        submitForm();
      }
    }

    form.on('submit', processFormSubmit);
  });
})(window.jQuery);
