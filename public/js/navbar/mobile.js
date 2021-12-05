/**
 * Toggle the classes when the burger is clicked
 * @param {Object} navburger
 * @param {Object} navbar
 * @param {Object} e
 */
function clickedBurger(navburger, navbar, e) {
  e.preventDefault();
  navburger.toggleClass('is-active');
  navbar.toggleClass('is-active');
}

window.jQuery.noConflict();
(
  ($) => {
    $(function () {
      const navbar = $('#navbar');
      const navburger = $('#navburger');

      navburger.on('click', clickedBurger.bind(undefined, navburger, navbar));
    });
  })(window.jQuery);
