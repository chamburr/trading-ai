import axios from 'axios';

import { SMA, EMA, WMA, VWAP, RSI } from './indicators.js';

let errorMessage = 'An unknown API error occurred.';

function formatDate(date, noTime=false) {
    date = new Date(date * 1000);
    date = date.toLocaleString('zh-CN', {
        timeZone: 'America/New_York',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    date = date.replace(/\//g, '-');

    if (noTime) date = date.split(' ')[0];

    return date;
}

async function searchStock(stockName) {
    return new Promise((resolve, reject) => {
        axios.get('https://api.robinhood.com/instruments/?query=' + encodeURI(stockName)).then(res => {
            res = res.data;

            resolve(res.results);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockQuote(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + stockID + '?modules=price').then(res => {
            res = res.data;

            resolve(res['quoteSummary']['result'][0]['price']['regularMarketPrice']['raw']);
        }).catch(() => reject(new Error(errorMessage)));
    })
}

async function getPreviousStockClose(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + stockID + '?modules=price').then(res => {
            res = res.data;

            resolve(res['quoteSummary']['result'][0]['price']['regularMarketPreviousClose']['raw']);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockHighLow(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + stockID + '?modules=price').then(res => {
            res = res.data;

            resolve({
                'high': res['quoteSummary']['result'][0]['price']['regularMarketDayHigh']['raw'],
                'low': res['quoteSummary']['result'][0]['price']['regularMarketDayLow']['raw']
            });
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockData(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v8/finance/chart/' + stockID + '?interval=5m&range=1d').then(res => {
            res = res.data;

            let dates = [];
            let prices = [];
            let volumes = [];

            for (let [index, entry] of res['chart']['result'][0]['timestamp'].entries()) {
                dates.push(formatDate(entry));
                prices.push(res['chart']['result'][0]['indicators']['quote'][0]['close'][index]);
                volumes.push(res['chart']['result'][0]['indicators']['quote'][0]['volume'][index]);
            }

            resolve([dates, prices, volumes]);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockPrices(stockID, range) {
    return new Promise((resolve, reject) => {
        let interval = '';

        if (range === '1d') interval = '5m';
        else if (range === '5d') interval = '30m';
        else if (range === '1mo') interval = '1d';
        else if (range === '3mo') interval = '1d';
        else if (range === '6mo') interval = '1wk';
        else if (range === '1y') interval = '1wk';
        else if (range === '2y') interval = '1mo';
        else if (range === '5y') interval = '1mo';

        axios.get('https://query2.finance.yahoo.com/v8/finance/chart/' + stockID + '?interval=' + interval + '&range=' + range).then(res => {
            res = res.data;

            let dates = [];
            let prices = [];
            let volumes = [];

            for (let [index, entry] of res['chart']['result'][0]['timestamp'].entries()) {
                dates.push(formatDate(entry));
                prices.push(res['chart']['result'][0]['indicators']['quote'][0]['close'][index]);
                volumes.push(res['chart']['result'][0]['indicators']['quote'][0]['volume'][index]);
            }

            resolve([dates, prices, volumes]);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockIndicator(stockID, indicator) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v8/finance/chart/' + stockID + '?interval=1d&range=3mo').then(res => {
            res = res.data;

            let dates = [];
            let prices = {
                high: [],
                low: [],
                close: []
            };
            let volumes = [];

            for (let [index, entry] of res['chart']['result'][0]['timestamp'].entries()) {
                dates.push(formatDate(entry, true));
                prices.high.push(res['chart']['result'][0]['indicators']['quote'][0]['high'][index]);
                prices.low.push(res['chart']['result'][0]['indicators']['quote'][0]['low'][index]);
                prices.close.push(res['chart']['result'][0]['indicators']['quote'][0]['close'][index]);
                volumes.push(res['chart']['result'][0]['indicators']['quote'][0]['volume'][index]);
            }

            let result;

            if (indicator === 'rsi') result = (new RSI({ period: 10, values: prices.close })).getResult();
            else if (indicator === 'vwap') result = (new VWAP({ volume: volumes, ...prices })).getResult();
            else if (indicator === 'sma') result = (new SMA({ period: 10, values: prices.close })).getResult();
            else if (indicator === 'ema') result = (new EMA({ period: 10, values: prices.close })).getResult();
            else if (indicator === 'wma') result = (new WMA({ period: 10, values: prices.close })).getResult();

            resolve([dates, result]);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getStockHistoricalDaily(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v8/finance/chart/' + stockID + '?interval=1d&range=5y').then(res => {
            res = res.data;

            let dates = [];
            let prices = [];

            for (let [index, entry] of res['chart']['result'][0]['timestamp'].entries()) {
                if (res['chart']['result'][0]['timestamp'].length - (index + 1) >= 500) continue;

                dates.push(formatDate(entry, true));
                prices.push(res['chart']['result'][0]['indicators']['quote'][0]['close'][index]);
            }

            resolve([dates, prices]);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

async function getDataForPrediction(stockID) {
    return new Promise((resolve, reject) => {
        axios.get('https://query2.finance.yahoo.com/v8/finance/chart/' + stockID + '?interval=1d&range=1mo').then(res => {
            res = res.data;

            let dates = [];
            let prices = [];

            for (let [index, entry] of res['chart']['result'][0]['timestamp'].entries()) {
                if (res['chart']['result'][0]['timestamp'].length - (index + 1) >= 10) continue;

                dates.push(formatDate(entry, true));
                prices.push(res['chart']['result'][0]['indicators']['quote'][0]['close'][index]);
            }

            resolve([dates, prices]);
        }).catch(() => reject(new Error(errorMessage)));
    });
}

export {
    searchStock,
    getStockQuote,
    getPreviousStockClose,
    getStockHighLow,
    getStockData,
    getStockPrices,
    getStockIndicator,
    getStockHistoricalDaily,
    getDataForPrediction
};
