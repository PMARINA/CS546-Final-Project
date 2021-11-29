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
  const formElement = $('#loginForm');
  const emailField = $('#loginEmail');
  const pwdField = $('#loginPassword');
  const formBackground = $('#loginBackground');
  const formClose = $('#closeLogin');
  const loginModal = $('#loginModal');
  const loginButton = $('#loginButton');
  formElement.on('submit', formSubmit.bind(undefined, emailField, pwdField));
  formClose.on('click', (e)=>loginModal.removeClass('is-active'));
  formBackground.on('click', (e)=>loginModal.removeClass('is-active'));
  loginButton.on('click', (e)=> {
    e.preventDefault();
    loginModal.addClass('is-active');
  });

  $(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
      loginModal.removeClass('is-active');
    }
  });
})(window.jQuery);
