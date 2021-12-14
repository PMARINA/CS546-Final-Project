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
    const passwordForm = $("#passwordForm");
    const passwordCurrent = $("#existingPassword");
    const passwordNew = $("#newPwd");
    const passwordNewConf = $("#newPwdConf");

    //endregion

    function validatePasswordString(pwd) {
      let containsLower = false;
      let containsUpper = false;
      let containsSymbol = false;
      let containsNumber = false;
      const sufficientLength = pwd.length >= 8;
      for (let i = 0; i < pwd.length; i++) {
        const currentChar = pwd.charAt(i);
        const currCode = currentChar.charCodeAt(0);
        if (
          // Lowercase
          currCode >= "a".charCodeAt(0) &&
          currCode <= "z".charCodeAt(0)
        ) {
          containsLower = true;
        } else if (
          // Uppercase
          currCode >= "A".charCodeAt(0) &&
          currCode <= "Z".charCodeAt(0)
        ) {
          containsUpper = true;
        } else if (
          // Number
          currCode >= "0".charCodeAt(0) &&
          currCode <= "9".charCodeAt(0)
        ) {
          containsNumber = true;
        } else {
          // Not any of the others = symbol
          containsSymbol = true;
        }
      }
      return {
        sufficientLength,
        containsLower,
        containsUpper,
        containsNumber,
        containsSymbol,
      };
    }

    function validatePassword(e) {
      function validatePasswordElement(elem, name) {
        elem.parent().children("div.help").remove();
        const currPwd = elem.val();
        const validationOfPwd = validatePasswordString(currPwd);
        let everythingValid = true;
        for (const [_, value] of Object.entries(validationOfPwd)) {
          everythingValid = value && everythingValid;
          if (!everythingValid) {
            break;
          }
        }
        if (!everythingValid) {
          const helpDiv = $("<div class='help'></div>");
          const ul = $("<ul class='ul content'></ul>");
          for (const [key, val] of Object.entries(validationOfPwd)) {
            if (!val) {
              let msg;
              if (key.includes("Symbol")) msg = "Contain a symbol";
              else if (key.includes("Number")) msg = "Contain a number";
              else if (key.includes("Upper"))
                msg = "Contain an uppercase letter";
              else if (key.includes("Lower"))
                msg = "Contain a lowercase letter";
              else if (key.includes("Length")) msg = "Contain 8+ characters";
              else {
                console.log("Schema not up to date for validation");
              }
              ul.append($(`<li><p class='help is-danger'>${msg}</p></li>`));
            }
          }
          helpDiv.append("<p class='help is-danger'>Your password must...</p>");
          helpDiv.append(ul);

          elem.parent().append(helpDiv);
        }
        return !!everythingValid;
      }

      let valid = validatePasswordElement(passwordCurrent, "current password");
      valid = validatePasswordElement(passwordNew, "new password") && valid;
      valid = validatePasswordElement(passwordNewConf, "new password") && valid;
      passwordForm.children("p.help").remove();

      if (passwordNew.val() !== passwordNewConf.val()) {
        valid = false;
        passwordForm.children("p.help").remove();
        passwordForm.prepend(
          $('<p class="help is-danger"></p>').text(
            "The new password and confirmation of the new password must match"
          )
        );
      }
      if (!valid) {
        e.preventDefault();
      } else {
        const body = $("body");
        const contentAsElement = $(content);
        body.prepend(contentAsElement);
        body.css("overflow", "hidden");
        $.post("/preferences/updatePassword", {
          currentPassword: passwordCurrent.val(),
          newPassword: passwordNewConf.val(),
        }).always((data) => {
          setTimeout(() => {
            data = data.responseJSON;
            console.log(JSON.stringify(data));
            if (typeof data === "string") {
              contentAsElement.remove();
              passwordForm.children("p.help").remove();
              passwordForm.prepend(
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

    passwordForm.on("submit", validatePassword);
  });
})(window.jQuery);
