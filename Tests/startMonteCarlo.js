const Distributions = require('./../Distributions.js');

const d3 = require('d3-array');

const dl = require('./../OandaDownload.js');
const Time = require('./../Time.js')
const time = new Time();

const chalk = require('chalk');
const columnify = require('columnify')
const logUpdate = require('log-update');
const clui = require('clui');
const Progress = clui.Progress;

function formatPnL(pnl){
    return (pnl > 0 ? chalk.white.bold.bgBlue(pnl) : chalk.white.bold.bgRed(pnl));
}

module.exports.testMonteCarloStrategy = function(ANALYZEDAYS, RETURNHOURS, TRANSACTIONTHRESHOLD, DAYSAGO){
    return new Promise(async resolve => {
        let to = time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(DAYSAGO) - time.daysSeconds(2); //Leave some room for validation
        let from = to - time.daysSeconds(ANALYZEDAYS);

        /* VALIDATION */
        let validationFrom = to;
        let validationTo = to + time.hoursSeconds(RETURNHOURS);
        let success = 0;
        let failure = 0;

        let lines = [];
        let instruments = await dl.getInstruments();

        let thisProgressBar = new Progress(20);
        console.log("Starting ...");
        
        let validationTrades = []; 

        for(let id in instruments.instruments){

            let progress = id / instruments.instruments.length * 100;
            logUpdate(thisProgressBar.update(progress, 100));    

            let instrumentInfo = instruments.instruments[id];

            let candles = await dl.getInstrument(instrumentInfo.instrument, "M30", from, to); //M30

            let distr = Distributions.getReturnsDistribution(candles, RETURNHOURS * 2); //Depends on here!
            let relDistr = Distributions.getRelativeReturnsDistribution(candles, RETURNHOURS * 2); //Depends on here!
            
            let avgSpread = Distributions.getAverageSpread(candles);

            //let median = distr[parseInt((distr.length - 1) / 2)];

            lines.push({
                "Instrument":instrumentInfo.instrument,
                "Mean":d3.mean(distr), 
                "Median":d3.median(distr),
                "succLongChance":1 - Distributions.getUnderValueChance(distr, avgSpread),
                "succShortChance":Distributions.getUnderValueChance(distr, -avgSpread),            
                "relMean":d3.mean(relDistr), 
                "relMedian":d3.median(relDistr), 
                "Variance":d3.variance(distr), 
                "Deviation":d3.deviation(distr),
                "relDeviation":d3.deviation(relDistr), 
                "AvgSpread":avgSpread, 
                "AvgLong":(d3.median(distr) - (2 * avgSpread)), //formatPnL
                "AvgShort":(-d3.median(distr) - (2 * avgSpread)) //formatPnL
            });

            let line = lines[lines.length - 1];
            //console.log(line)
            
            /* VALIDATION */
            let validationCandles = await dl.getInstrument(instrumentInfo.instrument, "M30", validationFrom, validationTo); 

            let profit = 0;
            if(line.succLongChance > TRANSACTIONTHRESHOLD){
                profit = (validationCandles[validationCandles.length - 1].bid.c - validationCandles[0].ask.c);                      
                validationTrades.push("BUY -> " + validationCandles[0].ask.c + " -> " + validationCandles[validationCandles.length - 1].bid.c + " = " + formatPnL(profit))
            }

            if(line.succShortChance > TRANSACTIONTHRESHOLD){
                profit = -(validationCandles[validationCandles.length - 1].ask.c - validationCandles[0].bid.c)
                validationTrades.push("SELL -> " + validationCandles[0].bid.c + " -> " + validationCandles[validationCandles.length - 1].ask.c + " = " + formatPnL(profit))
            }

            if(profit > 0)
                success++;
            else if(profit < 0)
                failure++;
        }

        console.log(validationTrades.join("\r\n"))
        console.log(success + " / " + failure + " -> " + success / (success + failure))

        resolve(success / (success + failure));
        /*var fs = require('fs');
        var stream = fs.createWriteStream("output.csv");
            stream.once('open', function(fd) {
            stream.write(columnify(lines)); //{ columnSplitter: ';'}
            stream.end();
        });*/

        //console.log(columnify(lines));
    });
}

let count = 0;
let sum = 0;

let returnHours = 12;
let threshold = 0.65;

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 6).then(function(arg){
    console.log("10, 24, 0.6, " + 6, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");      
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 7).then(function(arg){
    console.log("10, 24, 0.6, " + 7, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 8).then(function(arg){
    console.log("10, 24, 0.6, " + 8, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 9).then(function(arg){
    console.log("10, 24, 0.6, " + 9, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 10).then(function(arg){
    console.log("10, 24, 0.6, " + 10, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 13).then(function(arg){
    console.log("10, 24, 0.6, " + 13, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 14).then(function(arg){
    console.log("10, 24, 0.6, " + 14, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});

module.exports.testMonteCarloStrategy(10, returnHours, threshold, 15).then(function(arg){
    console.log("10, 24, 0.6, " + 15, arg);
    if(isNaN(arg) == false){
        count++;
        sum += arg;
    }
    console.log("###### " + (sum / count * 100) + "%");
});