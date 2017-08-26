const request = require("request");
const crequest = require('cached-request')(request);
crequest.setCacheDirectory("tmp/cache");
crequest.setValue('ttl', 1000 * 60 * 60 * 24 * 20); //20 Tage

const practiceUrl = "https://api-fxpractice.oanda.com";
const liveUrl = "https://api-fxtrade.oanda.com";

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1fe66ad3be0bf2d4fa579667945faa15-656562a41bc087ed9c6e91f3b3947f99'
};

module.exports.getInstrument = function(pair, granularity, from, to, callback){
    crequest({url: practiceUrl + "/v3/instruments/"+pair+"/candles?price=BAM&granularity="+granularity+"&from=" + from + "&to=" + to, headers: headers}, 
    function(error, response, body){    
        if(error != undefined)
            console.log(error)
        else
            callback(pair, JSON.parse(body))
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

module.exports.getInstruments = function(callback){
    module.exports.getAccounts(function(accountsResult){
        crequest({url: practiceUrl + "/v1/instruments?accountId="+accountsResult.accounts[0].accountId, headers: headers}, 
        function(error, response, body){
            if(error != undefined)
                console.log(error)
            else
                callback(JSON.parse(body))
        });
    });
}