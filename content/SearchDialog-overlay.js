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

  const conditionRows = () => {
    return Array.slice(document.querySelectorAll('searchvalue'), 0);
  };
  const bodyConditionRows = () => {
    return conditionRows().filter(aRow => {
      return aRow.searchAttribute == Components.interfaces.nsMsgSearchAttrib.Body;
    });
  };
  const rowToField = (aRow) => {
    const fields = document.getAnonymousNodes(aRow);
    return fields[aRow.getAttribute('selectedIndex')];
  };

  let checkedTerms;

  gSearchBodyInQuotedPrintable = new SearchBodyInQuotedPrintable({
    fields: () => {
      return bodyConditionRows().map(rowToField);
    },
    onFieldExpanded: (aField, aExpandedTerms) => {
      checkedTerms = checkedTerms || new Map();
      if (checkedTerms.get(aField.value))
        return;
      for (let term of aExpandedTerms) {
        if (checkedTerms.get(term) ||
            bodyConditionRows().some(aRow => {
              if (rowToField(aRow).value == term) {
                checkedTerms.set(term, true);
                return true;
              }
              else {
                return false;
              }
            }))
          continue;
        onMore(null);
        const rows = conditionRows();
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
      checkedTerms = null;
    }
  });
}, false);
