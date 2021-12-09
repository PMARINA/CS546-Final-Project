window.jQuery.noConflict();
(($) => {
  $(function (events, handler) {
    // HTML DOM Elements
    const buildingHelpText = $("#buildingHelpText"); // Validation
    const buildingSelection = $("select[name='building']"); // Which building is the problem in
    const washerRadioElement = $("#washer"); // The washer element (to select washer/drier)
    const whichSpecificMachineDropdown = $("#whichMachine"); // User selects which machine is causing issue
    const machineCategorySelection = $("input[name='machineType']"); // User wants to report washer/drier
    const reportType = $("input[name='reportType']"); // user wants to report building/machine
    const categorySelectionHelpText = $("#categorySelectionHelpText"); // reportType Help Text Validation
    const selectedMachineTypeText = $("#selectedMachineTypeText");
    const whichMachineText = $("#whichMachineText");
    const complaintField = $("#complaint");
    const complaintText = $("#complaintText");
    const severityText = $("#severityText");
    const form = $("#newReportForm");

    /**
     * Is the user reporting a building or a machine
     * @return {('building'|'machine'|undefined)} String
     */
    function getCurrentlySelectedOptionBuildingMachine() {
      const field = $("input[name='reportType']:checked");
      return field === undefined ? undefined : field.val();
    }

    /**
     *
     * @return {('washer'|'drier'|undefined)}
     */
    function getCurrentlySelectedOptionWasherDrier() {
      const field = $("input[name='machineType']:checked");
      return field === undefined ? undefined : field.val();
    }

    /**
     * Get the currently selected machine the user wants to complain about
     * @return {String}
     */
    function getCurrentlySelectedMachineId() {
      const field = $("#whichMachine");
      return field === undefined ? undefined : field.val();
    }

    /**
     * Get the complaint
     * @return {String}
     */
    function getComplaint() {
      return complaintField === undefined ? undefined : complaintField.val();
    }

    /**
     * Get currently selected report severity
     * @return {String}
     */
    function getSeverity() {
      return $("input[name='severity']:checked").val();
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
        buildingHelpText.text(
          "You must select a building. If none are available, then you do not have access to any " +
            "buildings and must apply for access to a building and wait for an admin or RA to approve your access."
        );
        buildingHelpText.show();
        return false;
      } else {
        buildingHelpText.hide();
        return true;
      }
    }

    /**
     * Ensure the report is either a building or machine. If not, it's either because the schema was changed
     * or the user didn't select anything
     */
    function validateReportCategory() {
      const selectedCategory = getCurrentlySelectedOptionBuildingMachine();
      if (selectedCategory === undefined) {
        categorySelectionHelpText.text("You must select a report category.");
        categorySelectionHelpText.show();
        return false;
      } else if (
        selectedCategory !== "machine" &&
        selectedCategory !== "building"
      ) {
        categorySelectionHelpText.text(
          "The selected category is not valid per the clientside validation. " +
            "Please report this form to a developer/admin."
        );
        categorySelectionHelpText.show();
        return false;
      } else {
        categorySelectionHelpText.hide();
        return true;
      }
    }

    /**
     * Validate that the machine is either drier or washer
     */
    function validateMachineType() {
      const selectedMachineType = getCurrentlySelectedOptionWasherDrier();
      if (selectedMachineType === "washer" || selectedMachineType === "drier") {
        selectedMachineTypeText.hide();
        return true;
      } else if (selectedMachineType === undefined) {
        selectedMachineTypeText.text(
          "You must select a washer or drier if reporting a machine"
        );
        selectedMachineTypeText.show();
        return false;
      } else {
        selectedMachineTypeText.text(
          "The selected Machine Type is not valid per the clientside validation. " +
            "Please report this form to a developer/admin."
        );
        selectedMachineTypeText.show();
        return false;
      }
    }

    function validateWhichMachine() {
      const machineId = getCurrentlySelectedMachineId();
      if (machineId === undefined || machineId.trim() === "") {
        whichMachineText.text(
          "A machine must be selected to report an issue with a machine. " +
            "If you are not finding a machine, please report this as a building concern " +
            "and mention this issue in your report."
        );
        whichMachineText.show();
        return false;
      } else {
        whichMachineText.hide();
        return true;
      }
    }

    function validateComplaint() {
      const complaint = getComplaint();
      if (complaint === undefined || complaint.trim() === "") {
        complaintText.text(
          "The complaint must not be empty. " +
            "Please let us know what is broken and what we can do to fix it."
        );
        complaintText.show();
        return false;
      } else {
        complaintText.hide();
        return true;
      }
    }

    function validateSeverity() {
      const severity = getSeverity();
      console.log(`Severity is: ${severity}`);
      if (severity === undefined) {
        severityText.text(
          "The severity must be defined to help us prioritize our response and resources. " +
            "Please let us know the urgency of this issue."
        );
        severityText.show();
        return false;
      } else if (
        severity === "catastrophic" ||
        severity === "inconvenient" ||
        severity === "minor"
      ) {
        severityText.hide();
        return true;
      } else {
        severityText.text(
          "The selected severity is not valid. " +
            "Please let an administrator know that this form needs to be updated."
        );
        severityText.show();
        return false;
      }
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
      if (getCurrentlySelectedOptionBuildingMachine() === "machine") {
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
      if (!validateForm()) {
        e.preventDefault();
      }
    }

    form.on("submit", processFormSubmit);
  });
})(window.jQuery);
