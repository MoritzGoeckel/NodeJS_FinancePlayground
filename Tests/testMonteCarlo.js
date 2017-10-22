const MonteCarlo = require(".././MonteCarlo.js");
const dl = require(".././OandaDownload.js");
const Time = require(".././Time.js");
let time = new Time();

async function start(){
    let candles = await dl.getInstrument("EUR_USD", "H1", time.getUTCGetLastEndOfWeekSeconds() - time.daysSeconds(5), time.getUTCGetLastEndOfWeekSeconds(), true);
    console.log(
        MonteCarlo.getMonteCarloStatistics(candles, 24)
        );
}

start();