(function ($) {
    /**
     * @param {String} appointmentId ObjectId
     */
     function deleteAppointments(appointmentId) {
        try {
          $.post(`/web/appointments/${appointmentId}`);
        } catch (e) {
          alert("Appointment could not be deleted. Try again later.")
          console.log(e);
        }
      }

      $('#nearAppts').on('click', '.cancel', function() {
        try{
          deleteAppointments(this.id);
          location.reload();
        }catch(e){
          console.log(e);
        }
      });
})(window.jQuery);