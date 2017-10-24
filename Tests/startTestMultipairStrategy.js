const TradeLog = require("../TradeLog.js");
const StrategyTester = require("../StrategyTester.js");
const Downloader = require("../OandaDownload.js");

const MultipairMonteCarlo = require("../Strategies/MultipairMonteCarlo.js");

var Time = require('../Time.js');
let time = new Time();

let to = time.getUTCGetLastEndOfWeekSeconds();
let from = to - time.daysSeconds(365);

let interval = time.daysSeconds(1)
console.log(interval * 0.1 / 60)

testStrategyOnTimeframe(["USD_JPY", "EUR_USD", "BCO_USD", "DE30_EUR", "US30_USD", "CORN_USD", "XAU_USD", "WTICO_USD"], "M10", from, to, MultipairMonteCarlo, 
    {analysisUnitsDistance:interval * 0.1 / 60, analysisIntervalSeconds:interval, threshold:0.6, lookbackSeconds:time.daysSeconds(10)}); 

async function testStrategyOnTimeframe(pairs, granularity, from, to, strategyType, dna) {
    let pairsAndCandles = {};
    for(let p in pairs)
        pairsAndCandles[pairs[p]] = await Downloader.getInstrument(pairs[p], granularity, from, to, true);

    let result = StrategyTester.executeMultipairStrategy(pairsAndCandles, strategyType, dna);
    
    let positives = 0;
    let profit = 0;
    
    for(let pair in result.tradeLogs){
        console.log("##################################  "+ pair + "  ##################################")
        result.tradeLogs[pair].printStats();
        result.tradeLogs[pair].printHistory();

        if(result.tradeLogs[pair].getTradeStats().positive > 0.5)
            positives++;

        if(result.tradeLogs[pair].getOverallProfit() >= 0)
            profit++;
    }

    console.log("Predictive: " + positives + " / " + Object.keys(result.tradeLogs).length)
    console.log("Profitable: " + profit + " / " + Object.keys(result.tradeLogs).length)
    
}