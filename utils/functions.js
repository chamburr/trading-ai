const db = require('./database.js').conn;
const { app, Notification } = require('electron');

module.exports = functions => {
    functions.getAppName = () => {
        return app.getName();
    };

    functions.getAppVersion = () => {
        return app.getVersion();
    };

    functions.sendNotification = (title, body) => {
        let notification = new Notification({
            title: title,
            body: body
        });

        notification.show();
    };

    functions.addStock = (name, id, high, low) => {
        if (functions.getStock(id) != undefined) return false;

        db.prepare('INSERT INTO Stocks (StockName, StockID, High, Low) VALUES (?, ?, ?, ?)').run(name, id, high, low);
    };

    functions.deleteStock = id => {
        db.prepare('DELETE FROM Stocks WHERE ID=?').run(id);
    };

    functions.updateStock = (id, high, low) => {
        db.prepare('UPDATE Stocks SET High=?, Low=? WHERE ID=?').run(high, low, id);
    };

    functions.getStock = id => {
        return db.prepare('SELECT * FROM Stocks WHERE StockID=?').get(id);
    };

    functions.getStockByID = id => {
        return db.prepare('SELECT * FROM Stocks WHERE ID=?').get(id);
    };

    functions.getAllStocks = () => {
        return db.prepare('SELECT * FROM Stocks').all();
    };

    functions.addAlert = (id, target, direction, renew) => {
        db.prepare('INSERT INTO Alerts (StockID, TargetPrice, Direction, AutoRenew) VALUES (?, ?, ?, ?)').run(id, target, direction, renew);
    };

    functions.deleteAlert = id => {
        db.prepare('DELETE FROM Alerts WHERE ID=?').run(id);
    };

    functions.updateAlert = (id, target) => {
        db.prepare('UPDATE Alerts SET TargetPrice=? WHERE ID=?').run(target, id);
    };

    functions.getAlert = id => {
        return db.prepare('SELECT * FROM Alerts WHERE ID=?').get(id);
    };

    functions.getAllAlerts = () => {
        return db.prepare('SELECT a.*, s.StockID as sStockID FROM Alerts a, Stocks s WHERE a.StockID=s.ID').all();
    };
};

// module.exports = (functions, mainWindow) => {
//     functions.sendToRenderer = (channel, message=null) => {
//         mainWindow.webContents.send(channel, message);
//     };
// }
