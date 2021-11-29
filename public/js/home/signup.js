/**
 * When the form is submitted, attempt to log the user in
 * @param {Object} emailField
 * @param {Object} pwdField
 * @param {Object} event
 */
function formSubmit(emailField, pwdField, event) {
  event.preventDefault();
  console.log(`Email: ${emailField.val()}`);
  console.log(`Password: ${pwdField.val()}`);
}

(($) => {
  const formElement = $('#signupForm');
  const emailField = $('#signupEmail');
  const pwdField = $('#signupPassword');
  const formBackground = $('#signupBackground');
  const formClose = $('#closeSignup');
  const signupModal = $('#signupModal');
  const signupButton = $('#signupButton');
  formElement.on('submit', formSubmit.bind(undefined, emailField, pwdField));
  formClose.on('click', (e)=>signupModal.removeClass('is-active'));
  formBackground.on('click', (e)=>signupModal.removeClass('is-active'));
  signupButton.on('click', (e)=> {
    e.preventDefault();
    signupModal.addClass('is-active');
  });

  $(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
      signupModal.removeClass('is-active');
    }
  });
})(window.jQuery);
