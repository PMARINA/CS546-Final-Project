window.jQuery.noConflict();
(($) => {
  $(function () {
    /**
     * When the response from the server is returned,
     * either redirect the user
     * or show error info
     * @param {String|Object} event
     */
    function manageLoginCallback(event) {
      if (typeof event === 'object' && event.redirect) {
        // window.location.replace(event.redirect);
        window.location.reload(true);
      } else {
        const formHelp = $('#loginFormHelp');
        formHelp.show();
        formHelp.text(event);
        formHelp.addClass('is-danger help');
        const loginButton = $('#loginSubmit');
        loginButton.removeClass('is-loading');
        loginButton.prop('disabled', false);
      }
    }

    /**
     *
     * @param {String} email
     * @return {Object}
     */
    function validateEmail(email) {
      const res = {
        email,
        message: '',
        valid: false,
      };
      if (typeof email !== 'string') {
        res.message = 'Email was not a string';
        return res;
      }
      email = email.trim();
      if (!email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
        res.message = 'Email was not valid';
        return res;
      }
      res.valid = true;
      res.email = email;
      return res;
    }

    /**
     *
     * @param {String} password
     * @return {Object}
     */
    function validatePwd(password) {
      const res = {
        password,
        message: '',
        valid: false,
      };
      if (typeof password !== 'string') {
        res.message = 'Password was not a string';
        return res;
      }
      let tooShort = false;
      if (password.length < 8) {
        tooShort = true;
      }
      let containsUpper = false;
      let containsLower = false;
      let containsNumber = false;
      let containsSymbol = false;
      const charCodeOf0 = '0'.charCodeAt(0);
      const charCodeOf9 = '9'.charCodeAt(0);

      const charCodeOfA = 'A'.charCodeAt(0);
      const charCodeOfZ = 'Z'.charCodeAt(0);

      const charCodeOfa = 'a'.charCodeAt(0);
      const charCodeOfz = 'z'.charCodeAt(0);

      for (let i = 0; i < password.length; i++) {
        const c = password.charCodeAt(i);
        if (c >= charCodeOf0 && c <= charCodeOf9) {
          containsNumber = true;
          continue;
        }
        if (c >= charCodeOfA && c <= charCodeOfZ) {
          containsUpper = true;
          continue;
        }
        if (c >= charCodeOfa && c <= charCodeOfz) {
          containsLower = true;
          continue;
        }
        containsSymbol = true;
      }
      res.valid = containsUpper && containsLower && containsNumber && containsSymbol && !tooShort;
      res.tooShort = tooShort;
      res.containsUpper = containsUpper;
      res.containsLower = containsLower;
      res.containsNumber = containsNumber;
      res.containsSymbol = containsSymbol;
      return res;
    }

    /**
     * When the form is submitted, attempt to log the user in
     * @param {Object} emailField
     * @param {Object} pwdField
     * @param {Object} event
     */
    async function formSubmit(emailField, pwdField, event) {
      event.preventDefault();
      const loginButton = $('#loginSubmit');
      loginButton.addClass('is-loading');
      loginButton.prop('disabled', true);
      const email = emailField.val();
      const password = pwdField.val();
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePwd(password);
      if (emailValidation.valid && passwordValidation.valid) {
        try {
          $.post('/login', {
            loginEmail: emailValidation.email,
            loginPassword: passwordValidation.password,
          }).done(manageLoginCallback);
        } catch (e) {
          console.log(e);
        }
      } else {
        loginButton.removeClass('is-loading');
        $('#loginSubmit').prop('disabled', false);
      }
      const emailHelp = $('#loginEmailHelp');
      if (!emailValidation.valid) {
        emailField.addClass('is-danger');
        emailHelp.addClass('is-danger');
        emailHelp.text('Please ensure your email is valid and try again');
        emailHelp.show();
      } else {
        emailHelp.empty();
        emailField.removeClass('is-danger');
        emailHelp.removeClass('is-danger');
        emailHelp.hide();
      }

      const passwordHelp = $('#loginPasswordHelp');
      if (!passwordValidation.valid) {
        pwdField.addClass('is-danger');
        passwordHelp.empty();
        passwordHelp.addClass('is-danger');

        function getElement(errMsg) {
          return $(`<li><p class="help is-danger">${errMsg}</p></li>`);
        }

        passwordHelp.append($('<p class="help is-danger">Your password is missing:</p>'));
        const ul = $('<ul class="ul"></ul>');
        if (passwordValidation.tooShort === true) ul.append(getElement('8+ characters in length'));
        if (passwordValidation.containsUpper === false) ul.append(getElement('Uppercase Character'));
        if (passwordValidation.containsLower === false) ul.append(getElement('Lowercase Character'));
        if (passwordValidation.containsNumber === false) ul.append(getElement('Digit'));
        if (passwordValidation.containsSymbol === false) ul.append(getElement('Symbol/Special Character'));
        passwordHelp.append(ul);
        passwordHelp.show();
      } else {
        pwdField.removeClass('is-danger');
        passwordHelp.empty();
        passwordHelp.removeClass('is-danger');
        passwordHelp.hide();
      }
    }

    const formElement = $('#loginForm');
    const emailField = $('#loginEmail');
    const pwdField = $('#loginPassword');
    const formBackground = $('#loginBackground');
    const formClose = $('#closeLogin');
    const loginModal = $('#loginModal');
    const loginButton = $('#loginButton');
    formElement.on('submit', formSubmit.bind(undefined, emailField, pwdField));
    formClose.on('click', (e) => loginModal.removeClass('is-active'));
    formBackground.on('click', (e) => loginModal.removeClass('is-active'));
    loginButton.on('click', (e) => {
      e.preventDefault();
      loginModal.addClass('is-active');
      emailField.focus();
    });

    $(document).on('keydown', function (event) {
      if (event.key === 'Escape') {
        loginModal.removeClass('is-active');
      }
    });
  });
})(window.jQuery);
