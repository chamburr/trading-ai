import $ from 'jquery';

import { openExternal, runFunction } from '../../utils/functions.js';

function init() {
    $('#settings-app-name').text(runFunction('getAppName'));
    $('#settings-app-version').text(runFunction('getAppVersion'));

    $('#settings-visit-website').click(() => openExternal('https://github.com/chamburr/trading-ai'));
    $('#settings-check-updates').click(() => openExternal('https://github.com/chamburr/trading-ai/releases'));

    $('[data-toggle="tooltip"]').tooltip();

    $('#settings-terms').val(`MIT License

Copyright (c) 2021 CHamburr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`.replace(/(?<!\n)\n(?!\n)/g, ' '));
}

export default init;

// import { checkForUpdates} from '../../utils/functions.js';
//
// function init() {
//     $('#settings-check-updates').click(() => checkForUpdates());
// }
