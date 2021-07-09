import $ from 'jquery';
import { getStockQuote } from '../../utils/stockapi.js';
import { showAlert, runFunction, checkInputPositive } from '../../utils/functions.js';

function init() {
    function getStocks() {
        let stocks = runFunction('getAllStocks');

        stocks.forEach(row => {
            $('#alert-me-select-stock').append(`<option value="${row.StockID}">${row.StockName} (${row.StockID})</option>`);
        });
    }

    function getAlerts() {
        $('#alert-me-alert-list').html('');

        let alerts = runFunction('getAllAlerts');
        alerts.forEach(row => {
            $('#alert-me-alert-list').append(`<tr>
                <td>${row.sStockID}</td>
                <td>$${row.TargetPrice}</td>
                <td>${row.AutoRenew === 1 ? 'Yes' : 'No'}</td>
                <td>${row.Direction === 'down' ? 'Falling' : 'Rising'}</td>
                <td>
                    <button class="btn btn-danger alert-me-delete-alert" type="button" data-delete-id="${row.ID}">Delete</button>
                </td>
            </tr>`);
        });
    }

    function getCurrentVal() {
        let stockID = $('#alert-me-select-stock').val();

        if (!stockID) return;

        $('#alert-me-current-value').val('Loading...');

        getStockQuote(stockID).then(price => {
            $('#alert-me-current-value').val('$' + price);
        }).catch(err => showAlert(err.message));
    }

    function setAlert() {
        let stockID = $('#alert-me-select-stock').val();
        let currVal = parseFloat($('#alert-me-current-value').val().replace('$', ''));
        let newVal = parseFloat($('#alert-me-target-value').val());

        if (!newVal) return showAlert('Please fill in all fields.');
        if (newVal < 0.01) return showAlert('Target price must be at least $0.01.');
        if (newVal === currVal) return showAlert('Target price must not be the current price.');

        let ID = runFunction('getStock', [stockID]).ID;
        let direction = newVal > currVal ? 'up' : 'down';
        let autoRenew = Number($('#alert-me-auto-renew').is(':checked'));

        runFunction('addAlert', [ID, newVal, direction, autoRenew]);
        showAlert('Alert added.');

        getAlerts();
    }

    $('#alert-me-select-stock').change(() => getCurrentVal());
    $('#alert-me-set-alert').click(() => setAlert());
    $('#alert-me-alert-manage').on('click', '.alert-me-delete-alert', event => {
        runFunction('deleteAlert', [$(event.currentTarget).attr('data-delete-id')]);
        showAlert('Alert deleted.');

        getAlerts();
    });

    $('[data-toggle="tooltip"]').tooltip();

    checkInputPositive($('#alert-me-target-value'), true);

    getStocks();
    getAlerts();
}

export default init;
