window.jQuery.noConflict();
const accessGroupSelector = '#accessGroupSelection';
const otherFieldSelector = '#otherGroupField';
(function($) {
  $(function() {
    /**
       * When the selection is changed, evaluate if the other field should be enabled/disabled...
       * @param {Object} event
       */
    function updateOther(event) {
      const select = $(accessGroupSelector);
      const other = $(otherFieldSelector);
      selected = select.val();
      if (selected === selected.toLowerCase()) {
        other.prop('disabled', true);
      } else {
        other.prop('disabled', false);
      }

    }

    /**
     * Convert the string to title case (without consideration for small words (i.e., 'a', 'for', ...)
     * @param {String} s
     * @return {String}
     */
    function toTitleCase(s) {
      s = s.toLowerCase();
      let lastWasSpace = true;
      let newString = '';
      for (let i = 0; i < s.length; i++) {
        if (lastWasSpace) {
          newString += s.charAt(i).toUpperCase();
        } else {
          newString += s.charAt(i);
        }
        lastWasSpace = s[i] === ' ';
      }
      return newString;
    }

    /**
       * Given a list of access groups, populate the sign up form
       * @param {String[]} data
       */
    function processAccessGroups(data) {
      if (!data) return;
      const select = $(accessGroupSelector);
      for (let i = data.length - 1; i >= 0; i--) {
        const e = data[i];
        const newElement = `<option value="${e}" class="option">${toTitleCase(e)}</option>`;
        select.prepend(newElement);
      }
      select.val(data[0]);
      select.on('change', updateOther);
    }

    $.get('/buildings/listOfAccessGroups').done(processAccessGroups);
  });
}
)(window.jQuery);
