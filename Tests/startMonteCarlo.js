const Distributions = require('./../Distributions.js');

const d3 = require('d3-array');

const dl = require('./../OandaDownload.js');
const Time = require('./../Time.js')
const time = new Time();

const chalk = require('chalk');
const columnify = require('columnify')

let to = time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7 * 2); //Leave some room for validation
let from = to - time.daysSeconds(365);

function formatPnL(pnl){
    return (pnl > 0 ? chalk.white.bold.bgBlue(pnl) : chalk.white.bold.bgRed(pnl));
}

async function start(){

    let lines = [];
    let instruments = await dl.getInstruments();
    
    for(let id in instruments.instruments){
        let instrumentInfo = instruments.instruments[id];

        let candles = await dl.getInstrument(instrumentInfo.instrument, "M30", from, to);

        let distr = Distributions.getReturnsDistribution(candles, 24);
        let relDistr = Distributions.getRelativeReturnsDistribution(candles, 24 * 2);
        
        let avgSpread = Distributions.getAverageSpread(candles);

        lines.push({
            "Instrument":instrumentInfo.instrument,
            "Mean":d3.mean(distr), 
            "Median":d3.median(distr), 
            "relMean":d3.mean(relDistr), 
            "relMedian":d3.median(relDistr), 
            "Variance":d3.variance(distr), 
            "Deviation":d3.deviation(distr),
            "relDeviation":d3.deviation(relDistr), 
            "AvgSpread":avgSpread, 
            "AvgLong":(d3.median(distr) - (2 * avgSpread)), //formatPnL
            "AvgShort":(-d3.median(distr) - (2 * avgSpread)) //formatPnL
        });
    }

    var fs = require('fs');
    var stream = fs.createWriteStream("output.csv");
        stream.once('open', function(fd) {
        stream.write(columnify(lines)); //{ columnSplitter: ';'}
        stream.end();
    });

    //console.log(columnify(lines));
}

start();
