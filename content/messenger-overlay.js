/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var gSearchBodyInQuotedPrintable;
window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
  window.removeEventListener(aEvent.type, onDOMContentLoaded, false);
  gSearchBodyInQuotedPrintable = new SearchBodyInQuotedPrintable({
    field: document.getElementById('qfb-qs-textbox')
  });
}, false);
