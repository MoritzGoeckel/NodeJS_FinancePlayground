const Distributions = require('./../Distributions.js');

const d3 = require('d3-array');

const dl = require('./../OandaDownload.js');
const Time = require('./../Time.js')
const time = new Time();

const chalk = require('chalk');
const columnify = require('columnify')

let to = time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7 * 2) - time.daysSeconds(2); //Leave some room for validation
let from = to - time.daysSeconds(10);

/* VALIDATION */
let validationFrom = to;
let validationTo = to + time.hoursSeconds(12);
let success = 0;
let failure = 0;


function formatPnL(pnl){
    return (pnl > 0 ? chalk.white.bold.bgBlue(pnl) : chalk.white.bold.bgRed(pnl));
}

async function start(){

    let lines = [];
    let instruments = await dl.getInstruments();
    
    for(let id in instruments.instruments){
        let instrumentInfo = instruments.instruments[id];

        let candles = await dl.getInstrument(instrumentInfo.instrument, "M30", from, to);

        let distr = Distributions.getReturnsDistribution(candles, 12 * 2);
        let relDistr = Distributions.getRelativeReturnsDistribution(candles, 12 * 2);
        
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
        if(line.succLongChance > 0.6){
            profit = (validationCandles[validationCandles.length - 1].bid.c - validationCandles[0].ask.c);                      
            console.log("BUY -> " + validationCandles[0].ask.c + " -> " + validationCandles[validationCandles.length - 1].bid.c + " = " + profit)
        }

        if(line.succShortChance > 0.6){
            profit = -(validationCandles[validationCandles.length - 1].ask.c - validationCandles[0].bid.c)
            console.log("SELL -> " + validationCandles[0].bid.c + " -> " + validationCandles[validationCandles.length - 1].ask.c + " = " + profit)
        }

        if(profit > 0)
            success++;
        else if(profit < 0)
            failure++;
    }

    console.log(success + " / " + failure + " -> " + success / (success + failure))

    var fs = require('fs');
    var stream = fs.createWriteStream("output.csv");
        stream.once('open', function(fd) {
        stream.write(columnify(lines)); //{ columnSplitter: ';'}
        stream.end();
    });

    //console.log(columnify(lines));
}

start();
