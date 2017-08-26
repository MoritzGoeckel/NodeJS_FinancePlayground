const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");
const optimizeStrategy = require("./optimizeStrategy.js");

const columnify = require('columnify')

const request = require("request");
const crequest = require('cached-request')(request);
crequest.setCacheDirectory("tmp/cache");
crequest.setValue('ttl', 1000 * 60 * 60 * 24 * 20); //20 Tage

var Time = require('./Time.js');
let time = new Time();

const MACrossover = require("./Strategies/MACrossover.js");

let practiceUrl = "https://api-fxpractice.oanda.com";
let liveUrl = "https://api-fxtrade.oanda.com";

let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1fe66ad3be0bf2d4fa579667945faa15-656562a41bc087ed9c6e91f3b3947f99'
};

function callback(error, response, body) {
    var info = JSON.parse(body);
    console.log("Candles loaded: " + info.candles.length)
    console.log("Hours: " + (info.candles.length / 60))
    console.log("Days: " + (info.candles.length / 60 / 24))
    
    
    let bestStrats = optimizeStrategy(info.candles, MACrossover, 1000, log => {return log.getTradeStats().semisharpe});
    bestStrats.forEach(strat => {strat.dna = JSON.stringify(strat.dna)})
    console.log("Best strategies:")
    console.log(columnify(bestStrats))

    let result = executeStrategy(info.candles, MACrossover, JSON.parse(bestStrats[0].dna));
    //result.tradeLog.printHistory();
    console.log("Best strategy: " + bestStrats[0].dna)   
    result.tradeLog.printStats();
}
   
crequest({url: practiceUrl + "/v3/instruments/EUR_USD/candles?price=BAM&granularity=M1&from=" + time.getUTCGetLastStartOfWeekSeconds() + "&to=" + time.getUTCGetLastEndOfWeekSeconds(), headers: headers}, callback);