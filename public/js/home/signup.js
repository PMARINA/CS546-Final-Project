((window) => {
  function processSignUpResponse($, msg) {
    const formHelpText = $('#signupFormHelpText');
    if (!msg) formHelpText.text('Something went wrong with the server. Please refresh the page and try again.');
    else {
      if (typeof msg === 'object') {
        window.location.replace(msg.redirect);
      } else {
        formHelpText.text(msg);
      }
    }
    if (formHelpText.text() !== '') {
      $('#closeSignup').get(0).scrollIntoView();
    }
  }

  /**
   * Remove all help text of the parent of the provided childElement
   * @param {Object} childElement
   */
  function removeExistingHelpText(childElement) {
    const parentElement = childElement.parent();
    for (const child of parentElement.children('.help, ul')) {
      child.remove();
    }
  }

  /**
   * Validate & Clean Name
   * @param {Object} n name field
   * @return {undefined|String}
   */
  function validateName(n) {
    let name = n.val();
    name = name.trim();
    n.val(name);
    const parentElement = n.parent();
    removeExistingHelpText(n);
    if (name.length === 0) {
      n.addClass('is-danger');
      parentElement.append('<p class="is-danger help">Name must not be empty/spaces.</p>');
      return undefined;
    }
    n.removeClass('is-danger');
    return name;
  }

  /**
   * Validate & Clean Email
   * @param {Object} e The email field
   * @return {string|undefined}
   */
  function validateEmail(e) {
    let email = e.val();
    email = email.trim();
    e.val(email);
    removeExistingHelpText(e);
    const parent = e.parent();
    if (email.length === 0 || !email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
      e.addClass('is-danger');
      parent.append('<p class="is-danger help">Email is not valid</p>');
      return undefined;
    }
    e.removeClass('is-danger');
    return email;
  }

  /**
   *
   * @param {Object} p
   * @param {Object} $
   * @return {String|undefined}
   */
  function validatePwd(p, $) {
    const password = p.val();
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
    const valid = containsUpper && containsLower && containsNumber && containsSymbol && !tooShort;
    if (valid) p.removeClass('is-danger');
    else p.addClass('is-danger');
    removeExistingHelpText(p);
    if (!valid) {
      const parent = p.parent();
      parent.append('<p class="is-danger help">Password is missing: </p>');
      const ul = $('<ul></ul>');
      getElement = (s) => `<li><p class="help is-danger">${s}</p></li>`;
      if (tooShort) ul.append(getElement('8+ Characters'));
      if (containsUpper === false) ul.append(getElement('Uppercase Character'));
      if (containsLower === false) ul.append(getElement('Lowercase Character'));
      if (containsNumber === false) ul.append(getElement('Numeric Character'));
      if (containsSymbol === false) ul.append(getElement('Special Character/Symbol'));
      parent.append(ul);
      parent.addClass('content');
    }
    return valid ? password : undefined;
  }

  function validateConfirmation(pwdField, pwdConfField) {
    const isCorrect = pwdField.val() === pwdConfField.val();
    removeExistingHelpText(pwdConfField);
    if (!isCorrect) {
      pwdConfField.parent().append('<p class="help is-danger">Passwords do not match</p>');
      pwdConfField.addClass('is-danger');
    } else {
      pwdConfField.removeClass('is-danger');
    }
    return isCorrect;
  }

  /**
   *
   * @param {Object} accessGroupList
   * @param {Object} accessGroupOther
   * @return {String|undefined}
   */
  function validateAccessGroup(accessGroupList, accessGroupOther) {
    removeExistingHelpText(accessGroupOther);
    let val = undefined;
    if (accessGroupOther.prop('disabled')) {
      val = accessGroupList.val();
    } else {
      val = accessGroupOther.val();
    }
    val = val.trim();
    if (val === '') {
      accessGroupOther.parent().append('<p class="help is-danger">Access Group must not be empty</p>');
      accessGroupOther.addClass('is-danger');
    } else {
      accessGroupOther.removeClass('is-danger');
    }
    return val === '' ? undefined : val;
  }

  /**
   * Process a sign up form submission
   * @param {JQueryStatic} $
   * @param {Object} firstNameField
   * @param {Object} lastNameField
   * @param {Object} emailField
   * @param {Object} pwdField
   * @param {Object} pwdConfField
   * @param {Object} accessGroupList
   * @param {Object} accessGroupOther
   * @param {Object} event
   */
  function formSubmit($, firstNameField, lastNameField, emailField, pwdField, pwdConfField, accessGroupList, accessGroupOther, event) {
    event.preventDefault();
    let firstName = validateName(firstNameField);
    let lastName = validateName(lastNameField);
    let email = validateEmail(emailField);
    let pwd = validatePwd(pwdField, $);
    let pwdIsConfirmed = validateConfirmation(pwdField, pwdConfField);
    let accessGroup = validateAccessGroup(accessGroupList, accessGroupOther);
    const inputs = [firstName, lastName, email, pwd, accessGroup];
    let validSignUpForm = pwdIsConfirmed;
    for (let i = 0; i < inputs.length; i++) {
      validSignUpForm = validSignUpForm && inputs[i];
    }
    if (validSignUpForm) {
      try {
        $.post('/signup', {
          firstName,
          lastName,
          email,
          pwd,
          accessGroup,
        }).done(processSignUpResponse.bind(undefined, $));
      } catch (e) {
        console.log(e);
      }
    }

  }

  window.jQuery.noConflict();
  (($) => {
    const x = () => {
      const formElement = $('#signupForm');
      const firstNameField = $('#signupNameFirst');
      const lastNameField = $('#signupNameLast');
      const pwdConfField = $('#signupPasswordConfirmation');
      const accessGroupList = $('#accessGroupSelection');
      const accessGroupOther = $('#otherGroupField');
      const emailField = $('#signupEmail');
      const pwdField = $('#signupPassword');
      const formBackground = $('#signupBackground');
      const formClose = $('#closeSignup');
      const signupModal = $('#signupModal');
      const signupButton = $('#signupButton');
      formElement.on('submit', formSubmit.bind(undefined, $, firstNameField, lastNameField, emailField, pwdField, pwdConfField, accessGroupList, accessGroupOther));
      formClose.on('click', (e) => signupModal.removeClass('is-active'));
      formBackground.on('click', (e) => signupModal.removeClass('is-active'));
      signupButton.on('click', (e) => {
        e.preventDefault();
        signupModal.addClass('is-active');
        firstNameField.focus();
      });

      $(document).on('keydown', function (event) {
        if (event.key === 'Escape') {
          signupModal.removeClass('is-active');
        }
      });
    };
    $(x);
  })(window.jQuery);
})(window);
