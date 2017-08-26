const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");
const optimizeStrategy = require("./optimizeStrategy.js");
const Downloader = require("./OandaDownload.js");

const columnify = require('columnify')

var Time = require('./Time.js');
let time = new Time();

const MACrossover = require("./Strategies/MACrossover.js");

function optimize(pair, data) {
    console.log("")
    console.log("################# " + pair + " #################")

    console.log("### Candles loaded: " + data.candles.length)
    console.log("Hours: " + (data.candles.length / 60))
    console.log("Days: " + (data.candles.length / 60 / 24))
    
    let bestStrats = optimizeStrategy(data.candles, MACrossover, 300, log => {return log.getTradeStats().semisharpe});
    bestStrats.forEach(strat => {strat.dna = JSON.stringify(strat.dna)})
    console.log("### Best strategies:")
    console.log(columnify(bestStrats))

    let result = executeStrategy(data.candles, MACrossover, JSON.parse(bestStrats[0].dna));
    //result.tradeLog.printHistory();
    console.log("### Best strategy: " + bestStrats[0].dna)   
    result.tradeLog.printStats();

    doNextInstrument();
}

let instrumentQueue = [];

function doNextInstrument(){
    Downloader.getInstrument(instrumentQueue[0], "M1", time.getUTCGetLastStartOfWeekSeconds(), time.getUTCGetLastEndOfWeekSeconds(), optimize)
    instrumentQueue.shift()
}

Downloader.getInstruments(function(result){
    result.instruments.forEach(entry => {
        instrumentQueue.push(entry.instrument);
    })
    doNextInstrument();
})