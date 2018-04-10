(function(aGlobal) {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;
  const Cr = Components.results;
  const Prefs = Cc['@mozilla.org/preferences;1'].getService(Ci.nsIPrefBranch);
  const { Promise } = Cu.import('resource://gre/modules/Promise.jsm', {});

  var SearchBodyInQuotedPrintable = {
    log : function(...aArgs) {
      if (!Prefs.getBoolPref('extensions.search-body-in-quoted-printable@clear-code.com.debug'))
        return;
      aArgs.unshift('search-body-in-quoted-printable: ');
      console.log(...aArgs);
    },

    init : function() {
    }
  };

  aGlobal.SearchBodyInQuotedPrintable = SearchBodyInQuotedPrintable;

  window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    window.removeEventListener(aEvent.type, onDOMContentLoaded, false);
    SearchBodyInQuotedPrintable.init();
  }, false);
})(this);
