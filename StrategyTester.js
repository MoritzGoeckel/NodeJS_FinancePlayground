const TradeLog = require("./TradeLog.js");

module.exports.executeStrategy = function(candles, strategyType, dna){
    let tradeLog = new TradeLog();
    let strategy = new strategyType(dna, tradeLog);

    candles.forEach(candle => {
        strategy.candleCompleted(candle);
    });

    let lastCandle = candles[candles.length - 1];
    tradeLog.closeAll(lastCandle.bid.c, lastCandle.ask.c, lastCandle.time, "Ending simulation");

    return {tradeLog: tradeLog, strategy:strategy};
}

    //Expecting as pairsAndCandles
    /*{
        pair1:[{ 
            complete: true,
            volume: 28,
            time: '2017-07-24T04:20:00.000000000Z',
            bid: { o: '1.16726', h: '1.16735', l: '1.16718', c: '1.16718' },
            mid: { o: '1.16732', h: '1.16741', l: '1.16724', c: '1.16724' },
            ask: { o: '1.16739', h: '1.16747', l: '1.16730', c: '1.16730' } 
        }, ...],
        pair2:[...]
    }*/

module.exports.executeMultipairStrategy = function(pairsAndCandles, strategyType, dna){
    let tradeLogs = {};
    
    let lengthOfLongestCandleList = 0;

    for(let pair in pairsAndCandles){
        tradeLogs[pair] = new TradeLog();

        //Find pair with longest history 
        //(This is all kinda inpercise as different timed candles will come into the strategy at the same time)
        if(pairsAndCandles[pair].length > lengthOfLongestCandleList)
            lengthOfLongestCandleList = pairsAndCandles[pair].length;
    }
    
    let strategy = new strategyType(dna, tradeLogs);


    let lastSeenCandleForPairs = {};

    for(let candleNum = 0; candleNum < lengthOfLongestCandleList; candleNum++){
        //Build input
        for(let pair in pairsAndCandles){
            if(pairsAndCandles[pair][candleNum] != undefined)
                lastSeenCandleForPairs[pair] = pairsAndCandles[pair][candleNum];
        }

        strategy.candleCompleted(lastSeenCandleForPairs);
    }

    //Closing all positions
    for(let pair in pairsAndCandles)
        tradeLogs[pair].closeAll(lastSeenCandleForPairs[pair].bid.c, lastSeenCandleForPairs[pair].ask.c, lastSeenCandleForPairs[pair].time, "Ending simulation");

    return {tradeLogs: tradeLogs, strategy:strategy};
}