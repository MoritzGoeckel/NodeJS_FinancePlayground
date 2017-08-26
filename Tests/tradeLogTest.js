let TradeLog = require("./TradeLog.js");

let tradeLog = new TradeLog();
tradeLog.openPosition("LONG", 0, 0, 0);

console.log(tradeLog.isPositionOpen("LONG"))