const TradeLog = require("../TradeLog.js");
const StrategyTester = require("../StrategyTester.js");
const Downloader = require("../OandaDownload.js");

const MultipairMonteCarlo = require("../Strategies/MultipairMonteCarlo.js");

var Time = require('../Time.js');
let time = new Time();

//Error handling
process.on('unhandledRejection', r => console.log(r))

let to = time.getUTCGetLastEndOfWeekSeconds();
let from = to - time.daysSeconds(300);

let interval = time.daysSeconds(1) / 2
//console.log(interval / 60 / 10)

testStrategyOnTimeframe("H1", from, to, MultipairMonteCarlo, 
    {analysisUnitsDistance:interval / 60 / 60, analysisIntervalSeconds:interval, threshold:0.6, lookbackSeconds:time.daysSeconds(7), reverse:false}); 

async function testStrategyOnTimeframe(granularity, from, to, strategyType, dna) {
    let pairs = [];

    let list = await Downloader.getInstruments()
    for(let i in list.instruments)
        pairs.push(list.instruments[i].instrument)

    let pairsAndCandles = {};
    for(let p in pairs)
        pairsAndCandles[pairs[p]] = await Downloader.getInstrument(pairs[p], granularity, from, to, true);
    
    let result = StrategyTester.executeMultipairStrategy(pairsAndCandles, strategyType, dna);
    
    let positives = 0;
    let profit = 0;
    let neutralProfit = 0;

    for(let pair in result.tradeLogs){
        console.log("##################################  "+ pair + "  ##################################")
        
        result.tradeLogs[pair].printStats();
        //result.tradeLogs[pair].printHistory();

        if(result.tradeLogs[pair].getTradeStats().positive > 0.5)
            positives++;

        if(result.tradeLogs[pair].getOverallProfit() > 0)
            profit++;
        
        if(result.tradeLogs[pair].getOverallProfit() == 0)
            neutralProfit++;
    }

    console.log("Predictive: " + positives + " / " + (Object.keys(result.tradeLogs).length - neutralProfit) + " (" + neutralProfit + ")")
    console.log("Profitable: " + profit + " / " + (Object.keys(result.tradeLogs).length - neutralProfit) + " (" + neutralProfit + ")")
    
}