/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var gSearchBodyInQuotedPrintable;
window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
  window.removeEventListener(aEvent.type, onDOMContentLoaded, false);

  const button = document.createElement('button');
  button.setAttribute('id', 'search-body-in-different-encoding-button');
  button.setAttribute('label', 'searchBodyInDifferentEncodingButton.label');
  button.setAttribute('tooltiptext', 'searchBodyInDifferentEncodingButton.tooltiptext');
  button.setAttribute('oncommand', 'if (gSearchBodyInQuotedPrintable.expandQuery()) document.getElementById("search-button").click();');

  const searchButton = document.getElementById('search-button');
  if (searchButton)
    searchButton.parentNode.insertBefore(button, searchButton);

  gSearchBodyInQuotedPrintable = new SearchBodyInQuotedPrintable({
    fields: () => {
      let searchValues = Array.slice(document.querySelectorAll('searchvalue'), 0);
      return searchValues.filter(aSearchValue => {
        return aSearchValue.searchAttribute == Components.interfaces.nsMsgSearchAttrib.Body
      }).map(aSearchValue => {
        const fields = document.getAnonymousNodes(aSearchValue);
        return fields[aSearchValue.getAttribute('selectedIndex')];
      });
    },
    onFieldExpanded: (aField, aExpandedTerms) => {
      for (let term of aExpandedTerms) {
        onMore(null);
        const rows = document.querySelectorAll('searchvalue');
        const row = rows[rows.length - 1];
        row.opParentValue = aField.parentNode.opParentValue;
        row.parentValue = aField.parentNode.parentValue;
        row.searchAttribute = aField.parentNode.searchAttribute;
        const fields = document.getAnonymousNodes(row);
        fields[row.getAttribute('selectedIndex')].value = term;
      }
    },
    onExpanded: () => {
      document.getElementById('booleanAndGroup').value = 'or';
      document.getElementById('search-button').click();
    }
  });
}, false);
