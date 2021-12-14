window.jQuery.noConflict();
(($) => {
  $(function (events, handler) {
    const content = `<div id="modal" class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <div class="media">
        <div class="media-left element">
        <div class="is-loading"><div class="button is-loading is-success is-large"></div></div>
        </div>
        <div class="media-content">
          <div class="content">
            <p>
              Conferring with the server. Please wait for this page to refresh.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

    //region HTML DOM Elements
    // Initial queries only
    const emailForm = $("#emailForm");
    const emailElement = $("#email");

    //endregion

    function validateEmail(e) {
      function validateEmailElement(elem, name) {
        elem.val(elem.val().trim());
        elem.parent().children("p.help").remove();
        if (elem.val().length <= 0) {
          elem
            .parent()
            .append(
              $(`<p class="help is-danger">The ${name} must not be empty</p>`)
            );
          return false;
        } else if (
          !emailElement
            .val()
            .match(
              /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
            )
        ) {
          elem
            .parent()
            .append(
              $(
                `<p class="help is-danger">The ${name} must be a valid email</p>`
              )
            );
          return false;
        } else {
          return true;
        }
      }

      let valid = validateEmailElement(emailElement, "email");
      if (!valid) {
        e.preventDefault();
      } else {
        const body = $("body");
        const contentAsElement = $(content);
        body.prepend(contentAsElement);
        body.css("overflow", "hidden");
        $.post("/preferences/updateEmail", {
          email: emailElement.val(),
        }).then((data) => {
          setTimeout(() => {
            if (typeof data === "string") {
              contentAsElement.remove();
              emailForm.children("p.help").remove();
              emailForm.prepend($('<p class="help is-danger"></p>').text(data));
            } else {
              window.location.href = "/preferences";
            }
          }, 2000);
        });
        e.preventDefault();
      }
    }

    emailForm.on("submit", validateEmail);
  });
})(window.jQuery);
