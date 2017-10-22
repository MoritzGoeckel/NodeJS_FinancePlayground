const request = require("request");
const crequest = require('cached-request')(request);
crequest.setCacheDirectory("tmp/cache");
crequest.setValue('ttl', 1000 * 60 * 60 * 24 * 20); //20 Tage

const clui = require('clui');
const Progress = clui.Progress;

const logUpdate = require('log-update');

const practiceUrl = "https://api-fxpractice.oanda.com";
const liveUrl = "https://api-fxtrade.oanda.com";

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1fe66ad3be0bf2d4fa579667945faa15-656562a41bc087ed9c6e91f3b3947f99'
};

//Todo: Do better caching! (Timestamp / Pair / Granularity)
module.exports.getInstrument = function(pair, granularity, fromSeconds, toSeconds, show){
    return new Promise(resolve => {
        let candles = [];

        let fromDate = new Date(fromSeconds * 1000);
        let toDate = new Date(toSeconds * 1000);   

        let lastRecordedCandleDate = 0;

        let thisProgressBar = new Progress(20);

        if(show)
            console.log("Loading " + pair + " " + granularity + "...");

        let doInstrumentRequest = function (actualFrom){
            let url = practiceUrl + "/v3/instruments/"+pair+"/candles?price=BAM&granularity=" + granularity + "&from=" + encodeURIComponent(actualFrom.toISOString()) + "&count=5000" + "&alignmentTimezone=Etc%2FUTC";
            //console.log(url);
            
            crequest({url: url, headers: headers},
            function(error, response, body){    
                if(error != undefined)
                    console.log(error)
                else{
                    let parsed = JSON.parse(body);
                    if(parsed.candles == undefined)
                        console.log(parsed)
                    
                    let done = false;
                    for(let candle in parsed.candles){
                        let candleDate = new Date(Date.parse(parsed.candles[candle].time));
                        if(candleDate <= toDate && candleDate > lastRecordedCandleDate){
                            candles.push(parsed.candles[candle]);
                            lastRecordedCandleDate = candleDate;
                        }
                        else{
                            done = true;
                            break;
                        }
                    }

                    //console.log("LEN! " + parsed.candles.length)
                    
                    let lastDate = new Date(Date.parse(candles[candles.length - 1].time));
                    let firstDate = new Date(Date.parse(candles[0].time));

                    /*console.log("New candle count: ", candles.length);                
                    console.log("ActualFrom: " + actualFrom.toISOString())    
                    console.log("First recievied: ", firstDate.toISOString())                                                                  
                    console.log("Last recievied: ", lastDate.toISOString())
                    console.log("From: ", fromDate.toISOString())                                
                    console.log("Going to: ", toDate.toISOString())
                    console.log("")*/
                    
                    let progress = (lastDate - fromDate) / (toDate - fromDate);

                    if(show)
                        logUpdate(thisProgressBar.update(progress * 100, 100) + " " + Math.round(progress * 100) + "/" + 100);                        

                    if(done){
                        if(show)
                            console.log("Done loading " + pair + " " + granularity + " ("+candles.length+" candles)")
                        
                        resolve(candles);
                    }
                    else
                        doInstrumentRequest(lastDate);
                }
            });
        }

        doInstrumentRequest(fromDate);
    });
}

module.exports.getAccountsV20 = function(callback){
    crequest({url: practiceUrl + "/v3/accounts", headers: headers}, 
    function(error, response, body){
        if(error != undefined)
            console.log(error)
        else
            callback(JSON.parse(body))
    });
}

module.exports.getAccounts = function(callback){
    crequest({url: practiceUrl + "/v1/accounts", headers: headers}, 
    function(error, response, body){
        if(error != undefined)
            console.log(error)
        else
            callback(JSON.parse(body))
    });
}

module.exports.getInstruments = function(){
    return new Promise(resolve => {
        module.exports.getAccounts(function(accountsResult){
            crequest({url: practiceUrl + "/v1/instruments?accountId="+accountsResult.accounts[0].accountId, headers: headers}, 
            function(error, response, body){
                if(error != undefined)
                    console.log(error)
                else
                    resolve(JSON.parse(body))
            });
        });
    });
}