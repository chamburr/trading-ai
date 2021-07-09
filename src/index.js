import React from 'react';
import ReactDOM from 'react-dom';

import $ from 'jquery';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'popper.js/dist/umd/popper.min.js';

import App from './App.jsx';
import SideBar from './Components/SideBar/index.jsx';
import MainContainer from './Components/MainContainer/index.jsx';

import AlertMe from './Pages/AlertMe/index.jsx';
import Dashboard from './Pages/Dashboard/index.jsx';
import Predict from './Pages/Predict/index.jsx';
import Settings from './Pages/Settings/index.jsx';

import { getStockQuote } from './utils/stockapi.js';
import { runFunction, showAlert } from './utils/functions.js';

ReactDOM.render(<App/>, document.getElementById('root'));
ReactDOM.render(<SideBar/>, document.getElementById('sidebar-container'));
ReactDOM.render(<MainContainer/>, document.getElementById('main-container'));
ReactDOM.render(<Dashboard/>, document.getElementById('page-row'));

$('#nav-alert-me').click(() => {
    ReactDOM.render(<AlertMe/>, document.getElementById('page-row'));
});
$('#nav-dashboard').click(() => {
    ReactDOM.render(<Dashboard/>, document.getElementById('page-row'));
});
$('#nav-predict').click(() => {
    ReactDOM.render(<Predict/>, document.getElementById('page-row'));
});
$('#nav-settings').click(() => {
    ReactDOM.render(<Settings/>, document.getElementById('page-row'));
});

window.electron.ipcRenderer.setMaxListeners(0);
window.electron.ipcRenderer.on('showAlert', (event, arg) => showAlert(arg));

function initializeAlerts() {
    let notif = {};
    let t = 0;

    setInterval(() => {
        let alerts = runFunction('getAllAlerts');
        alerts.forEach(row => {
            if (notif[row.ID]) return;

            setTimeout(() => {
                notif[row.ID] = setInterval(() => {
                    let stockData = runFunction('getStockByID', [row.StockID]);
                    let alertData = runFunction('getAlert', [row.ID]);

                    if (!stockData || !alertData) {
                        clearInterval(notif[row.ID]);
                        runFunction('deleteAlert', [row.ID]);

                        return;
                    }

                    getStockQuote(stockData.StockID).then(currVal => {
                        if ((row.Direction === 'up' && currVal >= row.TargetPrice) || (row.Direction === 'down' && currVal <= row.TargetPrice)) {
                            let direction = row.Direction === 'up' ? 'rising' : 'falling';

                            runFunction('sendNotification', [runFunction('getAppName'), `${stockData.StockName} (${stockData.StockID}) beat your target value of ${row.TargetPrice} while ${direction}.`]);

                            if (row.AutoRenew === 0) {
                                clearInterval(notif[row.ID]);
                                runFunction('deleteAlert', [row.ID]);
                            } else if (row.Direction === 'up') {
                                runFunction('updateAlert', [row.ID, row.TargetPrice + 2]);
                            } else {
                                runFunction('updateAlert', [row.ID, row.TargetPrice - 2]);
                            }
                        }
                    }).catch(err => showAlert(err.message));
                }, 60000);
            }, t);

            if (t < 60000) t += 500;
            else t = 0;
        });
    }, 10000);
}

initializeAlerts();
