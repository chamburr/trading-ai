const app = require('electron').app;
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(app.getPath('userData'), 'data.db'));

function initDB() {
    db.prepare(`CREATE TABLE IF NOT EXISTS Stocks (
        ID INTEGER PRIMARY KEY,
        StockName TEXT,
        StockID TEXT UNIQUE,
        High NUMERIC,
        Low NUMERIC
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS Alerts (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        StockID INTEGER,
        TargetPrice NUMERIC,
        Direction TEXT,
        AutoRenew INTEGER
    )`).run();

    return db;
}

initDB();

module.exports.initDB = initDB;
module.exports.conn = db;
