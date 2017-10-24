const dl = require('./../OandaDownload.js');

async function start(){
    let list = await dl.getInstruments()
    for(let i in list.instruments)
        console.log(list.instruments[i].instrument)
}

start();