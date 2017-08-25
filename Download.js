let TradeLog = require("./TradeLog.js");
let request = require("request");
let crequest = require('cached-request')(request);
//crequest.setCacheDirectory("tmp/cache");
//crequest.setValue('ttl', 1000 * 60 * 60 * 24);

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
    
    let highest = {score: NaN, dna: null};
    let nextDNA = {slow:60, fast:15};

    for(let round = 0; round < 1000; round++)
    {
        //Executing
        let tradeLog = new TradeLog();
        let strategy = new MACrossover(nextDNA, tradeLog);
        
        info.candles.forEach(candle => {
            strategy.candleCompleted(candle);
        });

        let lastCandle = info.candles[info.candles.length - 1];
        tradeLog.closeAll(lastCandle.bid.c, lastCandle.ask.c, lastCandle.time, "Ending simulation");
        
        //tradeLog.printHistory()
        tradeLog.printOverallProfit()
        console.log(highest)

        if(isNaN(highest.score) || highest.score < tradeLog.getOverallProfit())
            highest = {score: tradeLog.getOverallProfit(), dna:strategy.getDNA()};

        nextDNA = strategy.getRandomDNA();
        //End Executing
    }
}
   
crequest({url: practiceUrl + "/v3/instruments/EUR_USD/candles?price=BAM&granularity=M1&from=" + (time.getUTCTimestampSeconds() - time.days(1)) + "&to=" + time.getUTCTimestampSeconds(), headers: headers}, callback);