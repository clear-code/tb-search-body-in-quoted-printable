/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var gSearchBodyInQuotedPrintable;
window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
  window.removeEventListener(aEvent.type, onDOMContentLoaded, false);

  const setupButton = () => {
  const container = document.getElementById('booleanAndGroup');
  if (!container)
    return false;

  const spacer = document.createElement('spacer');
  spacer.setAttribute('flex', 1);
  container.appendChild(spacer);

  const button = document.createElement('button');
  button.setAttribute('id', 'search-body-in-different-encoding-button');
  button.setAttribute('label', gSearchBodyInQuotedPrintable.getLocalizedPref('extensions.search-body-in-quoted-printable@clear-code.com.searchDialog.button.label'));
  button.setAttribute('tooltiptext', gSearchBodyInQuotedPrintable.getLocalizedPref('extensions.search-body-in-quoted-printable@clear-code.com.searchDialog.button.tooltiptext'));
  button.setAttribute('oncommand', 'gSearchBodyInQuotedPrintable.expandQuery()');
  button.setAttribute('disabled', true);
  container.appendChild(button);

  const updateButton = () => {
    if (bodyConditionRows().length > 0)
      button.removeAttribute('disabled');
    else
      button.setAttribute('disabled', true);
  };

  SearchFolderDisplayWidget.prototype.__search_body_in_quoted_printable__onSearching = SearchFolderDisplayWidget.prototype.onSearching;
  SearchFolderDisplayWidget.prototype.onSearching = function(aIsSearching) {
    updateButton();
    return this.__search_body_in_quoted_printable__onSearching(aIsSearching);
  };

  window.__search_body_in_quoted_printable__onResetSearch = window.onResetSearch;
  window.onResetSearch = function(aEvent) {
    updateButton();
    return this.__search_body_in_quoted_printable__onResetSearch(aEvent);
  };

  window.__search_body_in_quoted_printable__onMore = window.onMore;
  window.onMore = function(aEvent) {
    updateButton();
    return this.__search_body_in_quoted_printable__onMore(aEvent);
  };

  window.__search_body_in_quoted_printable__onLess = window.onLess;
  window.onLess = function(aEvent) {
    updateButton();
    return this.__search_body_in_quoted_printable__onLess(aEvent);
  };
    return true;
  };

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
      if (!aField.value)
        return;
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
        if (aField.parentNode.value)
          row.value = aField.parentNode.value;
        rowToField(row).value = term;
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

  setupButton();
}, false);
