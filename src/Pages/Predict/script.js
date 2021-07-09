import $ from 'jquery';
import * as tf from '@tensorflow/tfjs';
import Chart from 'chart.js';
import { getDataForPrediction, getStockHistoricalDaily } from '../../utils/stockapi.js';
import { showAlert, runFunction, checkInputPositive } from '../../utils/functions.js';

function init() {
    let predictChart = new Chart($('#predict-graph'), {
        type: 'line',
        data: {
            datasets: [
                {
                    type: 'line',
                    label: 'Actual',
                    fill: false,
                    data: [],
                    borderColor: '#DC143C',
                    backgroundColor: '#DC143C',
                    pointRadius: 1
                },
                {
                    type: 'line',
                    label: 'Predicted',
                    fill: false,
                    data: [],
                    borderColor: '#006400',
                    backgroundColor: '#006400',
                    pointRadius: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
            },
            scales: {
                xAxes: [
                    {
                        display: true,
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
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Stock Price'
                        }
                    }
                ]
            }
        }
    });

    function minMaxScaler(val, min, max) {
        return (val - min) / (max - min);
    }

    function minMaxInverseScaler(val, min, max) {
        return val * (max - min) + min;
    }

    function getStocks() {
        let stocks = runFunction('getAllStocks');

        stocks.forEach(row => {
            $('#predict-select-stock').append(`<option value="${row.StockID}">${row.StockName} (${row.StockID})</option>`);
        });
    }

    function updatePredictChart() {
        let stockID = $('#predict-select-stock').val();

        if (!stockID) return;

        let lr = parseFloat($('#predict-learning-rate').val());
        let targetEpochs = parseFloat($('#predict-epochs').val());

        if (!lr) lr = 0.005;
        if (!targetEpochs) targetEpochs = 15;

        if (lr < 0.001 || lr > 1) {
            showAlert('Learning rate must be a value from 0.001 to 1.');

            $('#predict-training-button').removeClass('btn-danger');
            $('#predict-training-button').addClass('btn-success');
            $('#predict-training-button').html('START TRANING');

            window.startStop = 0;

            return;
        }

        let stockData = runFunction('getStock', [stockID]);

        predictChart.options.title.text = stockData.StockName;
        predictChart.options.scales.yAxes[0].scaleLabel.labelString = 'Stock Price';
        predictChart.update();

        showAlert('Fetching stock data...');

        getStockHistoricalDaily(stockID).then(data => {
            let prices = data[1];
            let min = Math.min.apply(null, prices);
            let max = Math.max.apply(null, prices);

            prices = prices.map(el => minMaxScaler(el, min, max));

            let dates = data[0];
            let lookbackPrices = [];
            let targets = [];

            for (let index = 10; index < prices.length; index++) {
                lookbackPrices[index - 10] = prices.slice(index - 10, index);
                targets.push(prices[index]);
            }

            let tfPrices = tf.tensor2d(lookbackPrices);
            global.pred = tf.tensor2d(lookbackPrices[0], [1, 10]);
            global.pred = tf.reshape(global.pred, [1, 10, 1]);
            let tfTargets = tf.tensor1d(targets);

            tfPrices = tf.reshape(tfPrices, [prices.length - 10, 10, 1]);

            let model = tf.sequential();
            model.add(tf.layers.lstm({ units: 32, inputShape: [10, 1] }));
            model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

            let opt = tf.train.adam(lr);
            let loss = 'meanSquaredError';

            showAlert('Compiling model...');

            model.compile({ optimizer: opt, loss: loss, metrics: ['mae', 'mse'] });

            async function fit() {
                let t = targets.map(el => minMaxInverseScaler(el, min, max));
                t = t.slice(t.length - 100, t.length);

                predictChart.data.labels = dates.slice(dates.length - 100, dates.length);

                let epochs = 1;

                while (epochs < targetEpochs && window.startStop === 1) {
                    await model.fit(tfPrices, tfTargets, {
                        epochs: 1,
                        callbacks: {
                            onEpochEnd: (epoch, log) => {
                                epochs += 1;

                                tf.tidy(() => {
                                    let pred = model.predict(tfPrices);

                                    pred.data().then(d => {
                                        let ds = d.map(el => minMaxInverseScaler(el, min, max));
                                        ds = ds.slice(d.length - 100, d.length);

                                        predictChart.data.datasets[0].data = t;
                                        predictChart.data.datasets[1].data = ds;
                                        predictChart.update();

                                        showAlert(`Training model (Epoch ${epochs}): Loss is ${log.loss}`);
                                    });
                                });
                            }
                        },
                        shuffle: true
                    });
                }
            }

            function predictNextStep(tfData) {
                let tfPred = model.predict(tfData);

                return tfPred.dataSync()[0];
            }

            fit().then(() => {
                window.startStop = 0;

                $('#predict-training-button').removeClass('btn-danger');
                $('#predict-training-button').addClass('btn-success');
                $('#predict-training-button').html('Start Training');

                getDataForPrediction(stockID).then(data => {
                    let prices = data[1];
                    prices = prices.slice(0, prices.length);

                    let lastPrice = prices[prices.length - 1];
                    let testdata = prices.map(el => minMaxScaler(el, min, max));
                    let tfTest = tf.tensor3d(testdata, [1, prices.length, 1]);
                    let tfPred = model.predict(tfTest);
                    let predVal = tfPred.dataSync()[0];
                    let finalPredictions = [];

                    for (let numPred = 0; numPred < 5; numPred++) {
                        testdata.shift();
                        testdata.push(predVal);

                        predVal = predictNextStep(tf.tensor3d(testdata, [1, prices.length, 1]));
                        finalPredictions.push(predVal);
                    }

                    finalPredictions = finalPredictions.map(el => minMaxInverseScaler(el, min, max))

                    let sum = finalPredictions.reduce((previous, current) => current += previous);
                    let forecastPrice = sum / finalPredictions.length;

                    showAlert('Training complete. Forecasted price: $' + Math.round(forecastPrice, 2));

                    if (forecastPrice > lastPrice) $('#predict-forecast-price').val(`$${Math.round(forecastPrice, 2)} (Bullish)`);
                    else $('#predict-forecast-price').val(`$${Math.round(forecastPrice, 2)} (Bearish)`);
                }).catch(err => showAlert(err.message));
            });
        }).catch(err => showAlert(err.message));
    }

    window.startStop = 0;

    $('#predict-training-button').click(() => {
        if (window.startStop === 1) {
            window.startStop = 0;

            $('#predict-training-button').removeClass('btn-danger');
            $('#predict-training-button').addClass('btn-success');
            $('#predict-training-button').html('Start Training');

            showAlert('Training stopping...');

            return;
        }

        showAlert('Loading...');

        if ($('#predict-select-stock').val() != null) {
            $('#predict-training-button').removeClass('btn-success');
            $('#predict-training-button').addClass('btn-danger');
            $('#predict-training-button').html('Stop Training');
            $('#predict-forecast-price').val('');

            window.startStop = 1;

            updatePredictChart();
        } else {
            showAlert('Please fill in all fields.');
        }
    });

    $('[data-toggle="tooltip"]').tooltip();

    checkInputPositive($('#predict-epochs'), false, 1, 500);
    checkInputPositive($('#predict-learning-rate'), true, null, 1);

    getStocks();
}

export default init;
