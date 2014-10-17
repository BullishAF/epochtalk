'use strict';
/* jslint node: true */

module.exports = [function () {
  return function(text, length) {
    if (isNaN(length)) {
      length = 10;
    }
    var end = '&hellip;';
    var endLen = 2;
    if (text.length <= length || text.length - endLen <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length - endLen).trim() + end;
    }
  };
}];