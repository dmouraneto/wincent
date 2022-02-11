// ==UserScript==
// @name         Make GitHub PR textareas bigger
// @namespace    https://wincent.com/
// @version      0.7
// @description  Make GitHub PR textareas bigger
// @author       Greg Hurrell <greg@hurrell.net>
// @match        https://github.com/*
// @grant        none
// @downloadURL  http://localhost/~<%= variables.username %>/UserScripts/github/makeTextAreasBigger.user.js
// @updateURL    http://localhost/~<%= variables.username %>/UserScripts/github/makeTextAreasBigger.user.js
// ==/UserScript==

(function () {
  'use strict';

  const style = document.createElement('style');

  style.innerHTML = `
        .previewable-comment-form textarea {
            min-height: 300px; /* normally 100px, which is ridiculous */
            max-height: none; /* normally 500px */
        }
    `;

  document.head.appendChild(style);
})();

// <%= variables.figManaged %>
