const Distributions = require('./Distributions.js');
const d3 = require('d3-array');

module.exports.getMonteCarloStatistics = function(candles, unitsDistance){
    let distr = Distributions.getReturnsDistribution(candles, unitsDistance);
    let relDistr = Distributions.getRelativeReturnsDistribution(candles, unitsDistance);
    
    let avgSpread = Distributions.getAverageSpread(candles);

    //let median = distr[parseInt((distr.length - 1) / 2)];

    return {
        "Mean":d3.mean(distr),
        "Median":d3.median(distr),
        "LongProfitProbability":1 - Distributions.getUnderValueChance(distr, avgSpread),
        "ShortProfitProbability":Distributions.getUnderValueChance(distr, -avgSpread),            
        "relMean":d3.mean(relDistr), 
        "relMedian":d3.median(relDistr), 
        "Variance":d3.variance(distr), 
        "Deviation":d3.deviation(distr),
        "relDeviation":d3.deviation(relDistr), 
        "AvgSpread":avgSpread, 
        "AvgLong":(d3.median(distr) - (2 * avgSpread)), //formatPnL
        "AvgShort":(-d3.median(distr) - (2 * avgSpread)) //formatPnL
    };
}

/*let count = 0;
let sum = 0;

let returnHours = 12;
let threshold = 0.65;

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 6).then(function(arg){
    console.log("10, 24, 0.6, " + 6, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");      
});*/

    //return new Promise(async resolve => {resolve()});
            
    /* VALIDATION */
    /*let validationCandles = await dl.getInstrument(instrumentInfo.instrument, "M30", validationFrom, validationTo); 

    let profit = 0;
    if(line.succLongChance > TRANSACTIONTHRESHOLD){
        profit = (validationCandles[validationCandles.length - 1].bid.c - validationCandles[0].ask.c);                      
        validationTrades.push("BUY -> " + validationCandles[0].ask.c + " -> " + validationCandles[validationCandles.length - 1].bid.c + " = " + formatPnL(profit))
    }

    if(line.succShortChance > TRANSACTIONTHRESHOLD){
        profit = -(validationCandles[validationCandles.length - 1].ask.c - validationCandles[0].bid.c)
        validationTrades.push("SELL -> " + validationCandles[0].bid.c + " -> " + validationCandles[validationCandles.length - 1].ask.c + " = " + formatPnL(profit))
    }*/