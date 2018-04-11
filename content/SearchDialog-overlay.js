/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var gSearchBodyInQuotedPrintable;
window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
  window.removeEventListener(aEvent.type, onDOMContentLoaded, false);

  const bundle = document.getElementById('search-body-in-quoted-printable-bundle');
  const button = document.createElement('button');
  button.setAttribute('id', 'search-body-in-different-encoding-button');
  button.setAttribute('label', bundle.getString('searchBodyInDifferentEncodingButton.label'));
  button.setAttribute('tooltiptext', bundle.getString('searchBodyInDifferentEncodingButton.tooltiptext'));
  button.setAttribute('oncommand', 'gSearchBodyInQuotedPrintable.expandQuery()');

  const searchButton = document.getElementById('search-button');
  if (searchButton)
    searchButton.parentNode.insertBefore(button, searchButton);

  const bodyConditionRows = () => {
    let searchValues = Array.slice(document.querySelectorAll('searchvalue'), 0);
    return searchValues.filter(aSearchValue => {
      return aSearchValue.searchAttribute == Components.interfaces.nsMsgSearchAttrib.Body;
    });
  };
  const rowToField = (aRow) => {
    const fields = document.getAnonymousNodes(aRow);
    return fields[aRow.getAttribute('selectedIndex')];
  };

  gSearchBodyInQuotedPrintable = new SearchBodyInQuotedPrintable({
    fields: () => {
      return bodyConditionRows().map(rowToField);
    },
    onFieldExpanded: (aField, aExpandedTerms) => {
      for (let term of aExpandedTerms) {
        const rows = bodyConditionRows();
        if (rows.some(aRow => rowToField(aRow).value == term))
          continue;
        onMore(null);
        const row = rows[rows.length - 1];
        row.opParentValue = aField.parentNode.opParentValue;
        row.searchAttribute = aField.parentNode.searchAttribute;
        row.value = aField.parentNode.value;
        rowToField(row).value = term;
        row.save();
      }
    },
    onExpanded: () => {
      const booleanCondition = document.getElementById('booleanAndGroup');
      if (booleanCondition.value != 'or')
        booleanCondition.querySelector('radio[value="or"]').click();
      onSearch();
    }
  });
}, false);
