const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");
const optimizeStrategy = require("./optimizeStrategy.js");
const Downloader = require("./OandaDownload.js");
const columnify = require('columnify')
const fs = require('fs');

var Time = require('./Time.js');
let time = new Time();

const MACrossover = require("./Strategies/MACrossover.js");

const stratlist = require('./tmp/optimized.json');

//console.log(stratlist)

//testStrategiesOnTimeframe(stratlist, "M1", time.getUTCGetLastStartOfWeekSeconds() - time.daysSeconds(7), time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7), MACrossover, function(result){})

testStrategyOnTimeframe("USD_JPY", "M1", time.getUTCGetLastStartOfWeekSeconds() - time.daysSeconds(7), time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7), MACrossover, {fast:30, slow:90}, 
    function(result){result.tradeLog.printStats();}
)


function testStrategiesOnTimeframe(strategies, granularity, from, to, strategyType, callback){
    strategies.forEach(strategy => {
        testStrategyOnTimeframe(strategy.instrument, granularity, from, to, strategyType, strategy.dna, function(result){
            console.log("#### "+strategy.instrument+" ("+JSON.stringify(strategy.dna)+") ####")
            result.tradeLog.printStats();
        });
    });
}

function testStrategyOnTimeframe(pair, granularity, from, to, strategyType, dna, callback) {
    Downloader.getInstrument(pair, granularity, from, to, function(pair, data){
        let result = executeStrategy(data.candles, strategyType, dna);
        callback(result);
    })
}