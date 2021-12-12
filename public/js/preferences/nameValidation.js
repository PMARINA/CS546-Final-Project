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
    const nameForm = $("#nameForm");
    const firstNameElement = $("#name-first");
    const lastNameElement = $("#name-last");

    //endregion

    function validateName(e) {
      function validateNameElement(elem, name) {
        elem.val(elem.val().trim());
        elem.parent().children("p.help").remove();
        if (elem.val().length <= 0) {
          elem
            .parent()
            .append(
              $(`<p class="help is-danger">The ${name} must not be empty</p>`)
            );
          return false;
        } else {
          return true;
        }
      }

      let valid = validateNameElement(firstNameElement, "first name");
      valid = validateNameElement(lastNameElement, "last name") && valid;
      if (!valid) {
        e.preventDefault();
      } else {
        const body = $("body");
        const contentAsElement = $(content);
        body.prepend(contentAsElement);
        body.css("overflow", "hidden");
        $.post("/preferences/updateName", {
          firstName: firstNameElement.val(),
          lastName: lastNameElement.val(),
        }).then((data) => {
          setTimeout(() => {
            if (typeof data === "string") {
              contentAsElement.remove();
              nameForm.children("p.help").remove();
              nameForm.prepend($('<p class="help is-danger"></p>').text(data));
            } else {
              window.location.href = "/preferences";
            }
          }, 2000);
        });
        e.preventDefault();
      }
    }

    nameForm.on("submit", validateName);
  });
})(window.jQuery);
