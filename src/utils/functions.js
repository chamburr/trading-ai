import React from 'react';
import ReactDOM from 'react-dom';

import Alert from '../Components/Alert/index.jsx';

let timeout = null;

function showAlert(msg) {
    ReactDOM.render(<Alert msg={msg}/>, document.getElementById('alert-container'));

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('alert-container'));
    }, 5000);
}

function openExternal(url) {
    window.electron.shell.openExternal(url);
}

function runFunction(func, args=[]) {
    args.unshift(func);
    return window.electron.ipcRenderer.sendSync('function', args);
}

function checkInputPositive(obj, float=false, min=null, max=null) {
    obj.on('input', function() {
        if (this.value === '') return;

        if (parseFloat(this.value) === 0 && min >= 1) return this.value = '';
        else if ((!float && /^[0-9]*$/g.test(this.value) === false) || (float && /^[0-9]*\.?[0-9]*$/g.test(this.value) === false)) {
            if (Object.prototype.hasOwnProperty.call(this, 'oldValue')) return this.value = this.oldValue;
            else return this.value = '';
        }
        else if (min != null && parseFloat(this.value) < min) this.value = min;
        else if (max != null && parseFloat(this.value) > max) this.value = max;

        this.oldValue = this.value;
    });
}

export {
    showAlert,
    openExternal,
    runFunction,
    checkInputPositive
};

// let id = 0;
//
// function runAsyncFunction(func, args=[]) {
//     id += 1;
//     args.unshift(id);
//     args.unshift(func);
//
//     window.electron.ipcRenderer.send('asyncFunction', args);
//
//     return new Promise((resolve, reject) => {
//         window.electron.ipcRenderer.once('asyncReply' + id, (event, arg) => {
//             resolve(arg);
//         });
//
//         window.electron.ipcRenderer.once('asyncReplyError' + id, (event, arg) => {
//             reject(arg);
//         });
//     });
// }
//
// export { runAsyncFunction };

// function checkForUpdates() {
//     return window.electron.ipcRenderer.sendSync('checkForUpdates');
// }
//
// export { checkForUpdates };
