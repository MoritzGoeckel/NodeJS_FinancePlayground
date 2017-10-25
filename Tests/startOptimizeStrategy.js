const TradeLog = require("./../TradeLog.js");
const StrategyTester = require("./../StrategyTester.js");
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
    //for(let instrumentId in result.instruments){

        let instrumentId = "SUGAR_USD"

        let candles = await dl.getInstrument(instrumentId, "M30", from, to); //result.instruments[instrumentId].instrument
        let validateCandles = await dl.getInstrument("SUGAR_USD", "M30", time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(7 * 2), time.getUTCGetLastEndOfWeekSeconds());
        
        optimize(instrumentId, candles, validateCandles)
    //}
}

function optimize(pair, candles, validateCandles) {
    //Optimize / Train
    let bestStrats = optimizeStrategy(candles, MACrossover, 1000, log => {return log.getTradeStats().sharpe * Math.pow(log.getTradeStats().trades, 1.5) * log.getTradeStats().positive}); //semi
    bestStrats.forEach(strat => {strat.dna = JSON.stringify(strat.dna)})
    
    //console.log(columnify(bestStrats))

    //Get results
    console.log("### BEST STRATEGY")
    console.log("### Best strategy: " + bestStrats[0].dna)   
    let result = StrategyTester.executeStrategy(candles, MACrossover, JSON.parse(bestStrats[0].dna));
    result.tradeLog.printStats();
    result.tradeLog.printHistory();

    //Validate
    console.log("### VALIDATION")
    let validateResult = StrategyTester.executeStrategy(validateCandles, MACrossover, JSON.parse(bestStrats[0].dna));
    validateResult.tradeLog.printStats();
    validateResult.tradeLog.printHistory();


    /*let stats = result.tradeLog.getTradeStats();
    if(stats.profit > 0) //Really? :D
        fs.appendFileSync('optimized.json', JSON.stringify({instrument:pair, dna:JSON.parse(bestStrats[0].dna), stats:stats}) + "\r\n");*/        
}