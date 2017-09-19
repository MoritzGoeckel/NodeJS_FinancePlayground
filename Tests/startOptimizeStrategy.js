const TradeLog = require("./../TradeLog.js");
const executeStrategy = require("./../executeStrategy.js");
const optimizeStrategy = require("./../optimizeStrategy.js");
const dl = require("./../OandaDownload.js");
const columnify = require('columnify')
const fs = require('fs');

var Time = require('./../Time.js');
let time = new Time();

const MACrossover = require("./../Strategies/MACrossover.js");

let to = time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7 * 2); //Offset - 2 weeks to leave some room for validation
let from = to - time.daysSeconds(365);

start();

async function start(){
    let result = await dl.getInstruments();
    for(let instrumentId in result.instruments){
        let candles = await dl.getInstrument(result.instruments[instrumentId].instrument, "M30", from, to);
        optimize(result.instruments[instrumentId].instrument, candles)
    }
}

function optimize(pair, candles) {
    let bestStrats = optimizeStrategy(candles, MACrossover, 1000, log => {return log.getTradeStats().semisharpe});
    bestStrats.forEach(strat => {strat.dna = JSON.stringify(strat.dna)})
    
    //console.log(columnify(bestStrats))

    let result = executeStrategy(candles, MACrossover, JSON.parse(bestStrats[0].dna));
    //result.tradeLog.printHistory();
    console.log("### Best strategy: " + bestStrats[0].dna)   
    result.tradeLog.printStats();

    let stats = result.tradeLog.getTradeStats();
    if(stats.profit > 0) //Really? :D
        fs.appendFileSync('optimized.json', JSON.stringify({instrument:pair, dna:JSON.parse(bestStrats[0].dna), stats:stats}) + ",\r\n");        
}