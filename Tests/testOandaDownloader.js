const dl = require('./../OandaDownload.js');
const Time = require('./../Time.js')
const time = new Time();

let to = time.getUTCGetLastEndOfWeekSeconds();
let from = to - time.daysSeconds(30 * 3);

dl.getInstrument("EUR_USD", "M5", from, to, function(pair, list){
    console.log(list.length)
    console.log("Callback!")
    //console.log(list)
})