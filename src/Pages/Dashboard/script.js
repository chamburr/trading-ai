import $ from 'jquery';
import Chart from 'chart.js';
import { searchStock, getStockHighLow, getStockPrices, getStockIndicator } from '../../utils/stockapi.js';
import { showAlert, runFunction } from '../../utils/functions.js';

function init() {
    let chart;

    function showPriceChart() {
        if (chart) chart.destroy();

        chart = new Chart($('#dashboard-graph'), {
            type: 'bar',
            data: {
                type: 'bar',
                datasets: [
                    {
                        type: 'line',
                        label: 'Stock Price',
                        data: [],
                        fill: false,
                        borderWidth: 2,
                        borderColor: 'rgba(196, 22, 98,1)',
                        backgroundColor: 'rgba(196, 22, 98,1)',
                        pointRadius: 1,
                        yAxisID: 'price'
                    },
                    {
                        type: 'bar',
                        label: 'Volume',
                        fill: false,
                        data: [],
                        backgroundColor: 'rgba(190, 135, 211, 0.8)',
                        yAxisID: 'volume'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Select a stock and a duration'
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false
                            },
                            distribution: 'series',
                            type: 'time',
                            scaleLabel: {
                                display: true,
                                labelString: 'Time'
                            }
                        }
                    ],
                    yAxes: [
                        {
                            type: 'linear',
                            position: 'left',
                            id: 'price',
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Stock Price'
                            }
                        },
                        {
                            type: 'linear',
                            position: 'right',
                            id: 'volume',
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Volume'
                            }
                        }
                    ]
                }
            }
        });
    }

    function showIndicatorChart() {
        if (chart) chart.destroy();

        chart = new Chart($('#dashboard-graph'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        type: 'line',
                        label: 'Stock Indicator',
                        data: [],
                        fill: false,
                        borderWidth: 2,
                        borderColor: 'rgba(196, 22, 98,1)',
                        backgroundColor: 'rgba(196, 22, 98,1)',
                        pointRadius: 1,
                        yAxisID: 'price'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Select a stock and an indicator'
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false
                            },
                            distribution: 'series',
                            type: 'time',
                            scaleLabel: {
                                display: true,
                                labelString: 'Time'
                            }
                        }
                    ],
                    yAxes: [
                        {
                            type: 'linear',
                            position: 'left',
                            id: 'price',
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Stock Indicator'
                            }
                        }
                    ]
                }
            }
        });
    }

    function updatePriceChart(stock) {
        showAlert('Loading...');

        let span = $('#dashboard-select-specific').val();
        let stockData = runFunction('getStock', [stock]);

        chart.options.title.text = stockData.StockName;
        chart.update();

        getStockPrices(stock, span).then(data => {
            let dates = data[0];
            let prices = data[1];
            let volumes = data[2];
            let merged_t = [];
            let merged_v = [];

            for (let index = 0; index < dates.length; index++) {
                merged_t.push({ x: dates[index], y: prices[index] });
                merged_v.push({ x: dates[index], y: volumes[index] });
            }

            chart.data.datasets[0].data = merged_t;
            chart.data.datasets[1].data = merged_v;
            chart.update();
        }).catch(err => showAlert(err.message));
    }

    function updateIndicatorChart(stock) {
        showAlert('Loading...');

        let indicator = $('#dashboard-select-specific').val();
        let stockData = runFunction('getStock', [stock]);

        chart.options.title.text = stockData.StockName;
        chart.update();

        getStockIndicator(stock, indicator).then(data => {
            let dates = data[0];
            let values = data[1];
            let merged_t = [];

            for (let index = 0; index < dates.length; index++) {
                merged_t.push({ x: dates[index], y: values[index] });
            }

            if (indicator === 'rsi') {
                chart.options.scales.yAxes[0].beginAtZero = true;
                chart.options.scales.yAxes[0].max = 100;
            }

            chart.data.datasets[0].data = merged_t;
            chart.update();
        }).catch(err => showAlert(err.message));
    }

    function updateStocks() {
        let stocks = runFunction('getAllStocks');
        let t = 0;

        stocks.forEach(row => {
            setTimeout(() => {
                getStockHighLow(row.StockID).then(data => {
                    runFunction('updateStock', [row.ID, data['high'], data['low']])
                }).catch();
            }, t);

            if (t < 20000) t += 500
        });

        initializeStockView();
    }

    function initializeStockView() {
        $('#dashboard-stock-list').html('');

        let stocks = runFunction('getAllStocks');
        stocks.forEach(row => {
            $('#dashboard-stock-list').append(`<div class="card">
                <h5 class="card-header">
                    <span class="dashboard-stock-id">${row.StockID}</span>
                    <span class="badge badge-pill badge-success">High: $${row.High}</span>
                </h5>
                <div class="card-body">
                    <div class="row">
                        <div class="col-8">
                            <p class="card-text">${row.StockName}</p>
                        </div>
                        <div class="col-4">
                            <button class="btn btn-danger dashboard-delete-stock" type="button" data-delete-id="${row.ID}">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`);
        });
    }

    $('#dashboard-add-stock').click(() => {
        showAlert('Loading...');

        let val = $('.rbt-input-main').val();

        if (val.includes('(') && val.includes(')')) {
            let stIndex = val.split('(')[1];

            stIndex = stIndex.split(')')[0];

            searchStock(stIndex).then(data => {
                for (let element of data) {
                    if (element['symbol'] === stIndex) {
                        let res = runFunction('addStock', [element['simple_name'] || element['name'], element['symbol'], 0, 0]);

                        $('.rbt-input-main').val('');

                        if (res === false) showAlert('Stock already exists.');
                        else showAlert('Stock added.');

                        initializeStockView();

                        break;
                    }
                }
            }).catch(err => showAlert(err.message));
        } else {
            searchStock(val).then(data => {
                if (!data.length) {
                    $('.rbt-input-main').val('');
                    showAlert('No such stock is found.');
                } else {
                    let element = data[0];
                    let res = runFunction('addStock', [element['simple_name'] || element['name'], element['symbol'], 0, 0]);

                    $('.rbt-input-main').val('');

                    if (res === false) showAlert('Stock already exists.');
                    else showAlert('Stock added.');

                    updateStocks();
                    initializeStockView();
                }
            });
        }
    });

    $('#dashboard-stock-list').on('click', '.dashboard-delete-stock', event => {
        event.stopImmediatePropagation();

        runFunction('deleteStock', [$(event.currentTarget).attr('data-delete-id')]);
        showAlert('Stock deleted.');

        initializeStockView();
    });

    let selectedStock = '';

    $('#dashboard-select-type').change(() => {
        let type = $('#dashboard-select-type').val();
        if (type === 'price') {
            $('#dashboard-label-specific').text('Duration:');
            $('#dashboard-select-specific').html(`<option value="day" selected>1 Day</option>
              <option value="week">1 Week</option>
              <option value="month">1 Month</option>
              <option value="3month">3 Months</option>
              <option value="6month">6 Months</option>
              <option value="year">1 Year</option>
              <option value="5year">5 Years</option>`);

            showPriceChart();

            if (selectedStock) updatePriceChart(selectedStock);
        }
        else if (type === 'indicator') {
            $('#dashboard-label-specific').text('Indicator:');
            $('#dashboard-select-specific').html(`<option value="ema" selected>EMA (Exponential Moving Average)</option>
              <option value="wma">WMA (Weighted Moving Average)</option>
              <option value="sma">SMA (Simple Moving Average)</option>
              <option value="vwap">VWAP (Volume Weighted Average Price)</option>
              <option value="rsi">RSI (Relative Strength Index)</option>`);

            showIndicatorChart();

            if (selectedStock) updateIndicatorChart(selectedStock);
        }
    });

    $('#dashboard-select-specific').change(() => {
        if (selectedStock) {
            let type = $('#dashboard-select-type').val();

            if (type === 'price') updatePriceChart(selectedStock);
            else if (type === 'indicator') updateIndicatorChart(selectedStock);
        }
    });

    $('#dashboard-stock-list').on('click', '.card', event => {
        let stockID = $('.dashboard-stock-id', event.currentTarget).html();
        selectedStock = stockID;

        let type = $('#dashboard-select-type').val();

        if (type === 'price') updatePriceChart(selectedStock);
        else if (type === 'indicator') updateIndicatorChart(selectedStock);
    });

    updateStocks();
    initializeStockView();
    showPriceChart();

    setInterval(() => updateStocks(), 20000);
}

export default init;
