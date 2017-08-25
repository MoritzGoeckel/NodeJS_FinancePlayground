let TradeLog = require("./TradeLog.js");

let request = require("request");

let crequest = require('cached-request')(request);
//crequest.setCacheDirectory("tmp/cache");
//crequest.setValue('ttl', 1000 * 60 * 60 * 24);

var Time = require('./Time.js');
let time = new Time();

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

    const SMA = require('technicalindicators').SMA;
    var smaLong = new SMA({period : 30, values : []});
    var smaShort = new SMA({period : 15, values : []});
    
    let tradeLog = new TradeLog();

    let lastSl = NaN;

    info.candles.forEach(candle => {
        let close = parseFloat(candle.mid.c);
        let long = smaLong.nextValue(close);
        let short = smaShort.nextValue(close);
        let sl = short - long;

        if(lastSl > 0 && sl < 0 && tradeLog.isPositionOpen("SHORT") == false){
            if(tradeLog.isPositionOpen("LONG"))
                tradeLog.closePosition("LONG", candle.bid.c, candle.time, null);

            tradeLog.openPosition("SHORT", candle.bid.c, candle.time, null)
        }

        if(lastSl < 0 && sl > 0 && tradeLog.isPositionOpen("LONG") == false){
            if(tradeLog.isPositionOpen("SHORT"))
                tradeLog.closePosition("SHORT", candle.ask.c, candle.time, null);

            tradeLog.openPosition("LONG", candle.ask.c, candle.time, null)
        }

        lastSl = sl;
    });

    tradeLog.printHistory()
    //console.log(tradeLog.openPositions)
}
   
crequest({url: practiceUrl + "/v3/instruments/EUR_USD/candles?price=BAM&granularity=M1&from=" + (time.getUTCTimestampSeconds() - time.days(1)) + "&to=" + time.getUTCTimestampSeconds(), headers: headers}, callback);