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
    const groupsForm = $("#accessGroupForm");
    const groupsElement = $("#multiselect");

    //endregion

    function validateGroups(e) {
      function validateGroupStrings(elem, name) {
        const selected = elem.val();
        elem.parent().children("p.is-danger").remove();
        if (selected.length === 0) {
          elem
            .parent()
            .append(
              "<p class='help is-danger'>You must apply for at least one user group</p>"
            );
          return false;
        }
        return true;
      }

      let valid = validateGroupStrings(groupsElement, "group");
      if (!valid) {
        e.preventDefault();
      } else {
        const body = $("body");
        const contentAsElement = $(content);
        body.prepend(contentAsElement);
        body.css("overflow", "hidden");
        $.post("/preferences/updateAppliedGroups", {
          groups: groupsElement.val(),
        }).always((data) => {
          setTimeout(() => {
            data = data.responseJSON;
            if (typeof data === "string") {
              contentAsElement.remove();
              groupsForm.children("p.help").remove();
              groupsForm.prepend(
                $('<p class="help is-danger"></p>').text(data)
              );
            } else {
              window.location.href = "/preferences";
            }
          }, 2000);
        });
        e.preventDefault();
      }
    }

    groupsForm.on("submit", validateGroups);
  });
})(window.jQuery);
