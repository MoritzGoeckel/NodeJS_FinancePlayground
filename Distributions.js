const stats = require("stats-lite")

module.exports.getReturnsDistribution = function(candles, candleDistance){
    let returns = [];
    for(let i = 0; i < candles.length - candleDistance; i++){
        let candle = candles[i];
        let futureCandle = candles[i + candleDistance];

        returns.push(futureCandle.mid.c - candle.mid.c);
        //Relative: (futureCandle.mid.c - candle.mid.c) / candle.mid.c)
    }

    return returns.sort();
}

module.exports.getRelativeReturnsDistribution = function(candles, candleDistance){
    let returns = [];
    for(let i = 0; i < candles.length - candleDistance; i++){
        let candle = candles[i];
        let futureCandle = candles[i + candleDistance];

        returns.push((futureCandle.mid.c - candle.mid.c) / candle.mid.c);
    }

    return returns.sort();
}

module.exports.getAverageSpread = function(candles){
    let spreads = [];
    for(let i = 0; i < candles.length; i++){
        spreads.push(candles[i].ask.c - candles[i].bid.c);
        spreads.push(candles[i].ask.o - candles[i].bid.o);
    }

    return stats.mean(spreads);
}