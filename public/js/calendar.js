(function ($) {
  $("#appointment").submit(async function (event) {
    event.preventDefault();
    const today = new Date();
    const calendarVal = new Date(
      $("#apptDate").val() + "T" + $("#apptTime").val()
    );
    // const timeVal = $('#apptTime').val();
    // console.log($("#apptDate").val() + $("#apptTime").val());
    // console.log(calendarVal);
    // console.log(today);
    if (calendarVal < today) {
      $("#error_body").text("Appointments can not be made in the past.");
      $("#error_body").show();
    } else {
      $("#error_body").hide();
    }
    // const render = function () {
    //     $.ajax({ url: '/', method: 'GET' })
    //     .then(function (data) {
    //     let htmlstr = '';
    //     data.forEach(element => {
    //     htmlstr +=<h1 class="content">${element.content}</h1>;
    //     });
    //     $('#addStr').html(htmlstr);
    //     })

    //     .catch(function (err) {
    //     console.log(err);
    //     });
    // }
  });
})(window.jQuery);
