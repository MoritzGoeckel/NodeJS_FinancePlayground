const Time = require("./Time.js");
let time = new Time();

const MonteCarlo = require("./MonteCarlo.js");

module.exports = class{
    constructor(dna, market){
        this.candleHistories = {};
        this.market = market;
        this.dna = dna;
        this.lastAnalysisTime = 0;
    }

    //Expecting as candles
    /*{
        pair1:{ 
            complete: true,
            volume: 28,
            time: '2017-07-24T04:20:00.000000000Z',
            bid: { o: '1.16726', h: '1.16735', l: '1.16718', c: '1.16718' },
            mid: { o: '1.16732', h: '1.16741', l: '1.16724', c: '1.16724' },
            ask: { o: '1.16739', h: '1.16747', l: '1.16730', c: '1.16730' } 
        },
        pair2:{...}
    }*/

    candleCompleted(candles){
        //Add new candle
        for(let pair in candles){
            if(this.candleHistories[pair] == undefined)
                this.candleHistories[pair] = [];
            
            this.candleHistories[pair].push(candles[pair]);
        }

        //Get the time now
        let currentTime = new Date(Date.parse(this.candleHistories[Object.keys(pair)[0]].time)).getTime();

        //Remove old ones
        for(let pair in this.candleHistories){
            while(new Date(Date.parse(this.candleHistories[pair][0].time)).getTime() + (this.dna.lookbackSeconds * 1000) < currentTime)
                this.candleHistories[pair].shift();
        }

        //Analyse on interval
        if(this.lastAnalysisTime + this.dna.analysisIntervalSeconds < currentTime){
            this.lastAnalysisTime = currentTime;

            //Close positions TODO!

            //Check if there is enough data for lookbacktime TODO!

            for(let pair in this.candleHistories){
                let stats = MonteCarlo.getMonteCarloStatistics(this.candleHistories[pair], this.dna.analysisUnitsDistance);

                let now = this.candleHistories[pair][this.candleHistories[pair].length - 1];

                if(stats.LongProfitProbability > this.dna.threshold){
                    //this.market.openPosition("LONG", now.ask.c, now.time, pair) DOES NOT WORK BECAUSE OF MULTIPAIR TODO!
                }
                if(stats.ShortProfitProbability > this.dna.threshold){
                    //this.market.openPosition("SHORT", now.bid.c, now.time, pair)
                }
            }

            //Todo: Do best trades / trade size??
        }
    }

    getOffspringDNA(exploration){
        return {analysisUnitsDistance:0, analysisIntervalSeconds:0, threshold:0, lookbackSeconds:0}
    }

    getDNA(){
        return this.dna;
    }

    static getRandomDNA(){
        
    }
}