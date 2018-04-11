/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(aGlobal) {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;
  const Cr = Components.results;
  const Prefs = Cc['@mozilla.org/preferences;1'].getService(Ci.nsIPrefBranch);
  const { Promise } = Cu.import('resource://gre/modules/Promise.jsm', {});

  var SearchBodyInQuotedPrintable = {
    lastSearchTerm : null,
    lastEncodedSearchTerm : null,

    log : function(...aArgs) {
      if (!Prefs.getBoolPref('extensions.search-body-in-quoted-printable@clear-code.com.debug'))
        return;
      aArgs.unshift('search-body-in-quoted-printable: ');
      console.log(...aArgs);
    },

    get field() {
      return document.getElementById('qfb-qs-textbox');
    },

    get defaultEncoding() {
      return 'ISO-2022-JP';
    },

    init : function() {
    },

    onCommand : function(aEvent) {
      if (!this.lastSearchTerm) {
        const searchTerm = this.field.value.trim();
        if (!searchTerm)
          return;
        this.lastSearchTerm = searchTerm;
      }
      const encoding = aEvent.target.getAttribute('value') || this.defaultEncoding;
      const encoded = this.toQuotedPrintable(this.lastSearchTerm, encoding);
      this.lastEncodedSearchTerm = encoded;
      this.field.value = encoded;
      this.field.doCommand();
    },

    toQuotedPrintable : function(aInput, aEncoding) {
      const converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                         .createInstance(Ci.nsIScriptableUnicodeConverter);
      converter.charset = aEncoding || 'UTF-8';
      return this.toQuotedPrintableFromAscii(converter.ConvertFromUnicode(aInput));
    },

    // from https://github.com/mathiasbynens/quoted-printable
    // original license: MIT
    // original author: Mathias Bynens
    toQuotedPrintableFromAscii : function(string) {
      var regexUnsafeSymbols = /[\0-\x08\n-\x1F=\x7F-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      // Encode symbols that are definitely unsafe (i.e. unsafe in any context).
      var encoded = string.replace(regexUnsafeSymbols, function(symbol) {
        if (symbol > '\xFF') {
          throw RangeError(
            '`quotedPrintable.encode()` expects extended ASCII input only. ' +
            'Don\u2019t forget to encode the input first using a character ' +
            'encoding like UTF-8.'
          );
        }
        var codePoint = symbol.charCodeAt(0);
        var hexadecimal = codePoint.toString(16).toUpperCase();
        return '=' + ('0' + hexadecimal).slice(-2);
      });

      // Limit lines to 76 characters (not counting the CRLF line endings).
      var lines = encoded.split(/\r\n?|\n/g);
      var lineIndex = -1;
      var lineCount = lines.length;
      var result = [];
      while (++lineIndex < lineCount) {
        var line = lines[lineIndex];
        // Leave room for the trailing `=` for soft line breaks.
        var LINE_LENGTH = 75;
        var index = 0;
        var length = line.length;
        while (index < length) {
          var buffer = encoded.slice(index, index + LINE_LENGTH);
          // If this line ends with `=`, optionally followed by a single uppercase
          // hexadecimal digit, we broke an escape sequence in half. Fix it by
          // moving these characters to the next line.
          if (/=$/.test(buffer)) {
            buffer = buffer.slice(0, LINE_LENGTH - 1);
            index += LINE_LENGTH - 1;
          } else if (/=[A-F0-9]$/.test(buffer)) {
            buffer = buffer.slice(0, LINE_LENGTH - 2);
            index += LINE_LENGTH - 2;
          } else {
            index += LINE_LENGTH;
          }
          result.push(buffer);
        }
      }

      // Encode space and tab characters at the end of encoded lines. Note that
      // with the current implementation, this can only occur at the very end of
      // the encoded string — every other line ends with `=` anyway.
      var lastLineLength = buffer.length;
      if (/[\t\x20]$/.test(buffer)) {
        // There’s a space or a tab at the end of the last encoded line. Remove
        // this line from the `result` array, as it needs to change.
        result.pop();
        if (lastLineLength + 2 <= LINE_LENGTH + 1) {
          // It’s possible to encode the character without exceeding the line
          // length limit.
          result.push(
            handleTrailingCharacters(buffer)
          );
        } else {
          // It’s not possible to encode the character without exceeding the line
          // length limit. Remvoe the character from the line, and insert a new
          // line that contains only the encoded character.
          result.push(
            buffer.slice(0, lastLineLength - 1),
            handleTrailingCharacters(
              buffer.slice(lastLineLength - 1, lastLineLength)
            )
          );
        }
      }

      // `Quoted-Printable` uses CRLF.
      return result.join('=\r\n');
    }
  };

  aGlobal.SearchBodyInQuotedPrintable = SearchBodyInQuotedPrintable;

  window.addEventListener('DOMContentLoaded', function onDOMContentLoaded(aEvent) {
    window.removeEventListener(aEvent.type, onDOMContentLoaded, false);
    SearchBodyInQuotedPrintable.init();
  }, false);
})(this);
