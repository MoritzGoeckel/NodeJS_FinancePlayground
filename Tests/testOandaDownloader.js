const dl = require('./../OandaDownload.js');
const Time = require('./../Time.js')
const time = new Time();

let to = time.getUTCGetLastEndOfWeekSeconds();
let from = to - time.daysSeconds(30 * 3);

async function start(){
    let list = await dl.getInstrument("EUR_USD", "M5", from, to, true)
    console.log(list.length)
    console.log("Callback!")
    console.log(list)
}

start();