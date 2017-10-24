const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");
const Downloader = require("./OandaDownload.js");

var Time = require('./Time.js');
let time = new Time();

const MACrossover = require("./Strategies/MACrossover.js");

const stratlist = require('./tmp/optimized.json');

//console.log(stratlist)

//testStrategiesOnTimeframe(stratlist, "M1", time.getUTCGetLastStartOfWeekSeconds() - time.daysSeconds(7), time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7), MACrossover, function(result){})

let to = time.getUTCGetLastEndOfWeekSeconds();
let from = to - time.daysSeconds(365);

testStrategyOnTimeframe("USD_JPY", "M30", from, to, MACrossover, {fast:30, slow:90}, 
    function(result){result.tradeLog.printStats();}
)


function testStrategiesOnTimeframe(strategies, granularity, from, to, strategyType){
    strategies.forEach(strategy => {
        let result = testStrategyOnTimeframe(strategy.instrument, granularity, from, to, strategyType, strategy.dna);
        console.log("#### " + strategy.instrument+" ("+JSON.stringify(strategy.dna)+") ####")
        result.tradeLog.printStats();
    });
}

async function testStrategyOnTimeframe(pair, granularity, from, to, strategyType, dna) {
    let candles = await Downloader.getInstrument(pair, granularity, from, to);
    let result = executeStrategy(candles, strategyType, dna);
    return result;
}