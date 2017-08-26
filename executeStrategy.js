const TradeLog = require("./TradeLog.js");

module.exports = function(candles, strategyType, dna){
    let tradeLog = new TradeLog();
    let strategy = new strategyType(dna, tradeLog);

    candles.forEach(candle => {
        strategy.candleCompleted(candle);
    });

    let lastCandle = candles[candles.length - 1];
    tradeLog.closeAll(lastCandle.bid.c, lastCandle.ask.c, lastCandle.time, "Ending simulation");

    return {tradeLog: tradeLog, strategy:strategy};
}