const SMA = require('technicalindicators').SMA;

module.exports = class{
    constructor(dna, market){
        this.dna = dna;

        this.market = market;
        this.smaLong = new SMA({period : dna.slow, values : []});
        this.smaShort = new SMA({period : dna.fast, values : []});
        this.lastSl = NaN;
    }

    candleCompleted(candle){
        let close = parseFloat(candle.mid.c);
        let long = this.smaLong.nextValue(close);
        let short = this.smaShort.nextValue(close);
        let sl = short - long;

        if(this.lastSl != NaN)
        {
            if(this.lastSl > 0 && sl < 0 && this.market.isPositionOpen("SHORT") == false){
                if(this.market.isPositionOpen("LONG"))
                    this.market.closePosition("LONG", candle.bid.c, candle.time, null);

                this.market.openPosition("SHORT", candle.bid.c, candle.time, null)
            }

            if(this.lastSl < 0 && sl > 0 && this.market.isPositionOpen("LONG") == false){
                if(this.market.isPositionOpen("SHORT"))
                    this.market.closePosition("SHORT", candle.ask.c, candle.time, null);

                this.market.openPosition("LONG", candle.ask.c, candle.time, null)
            }
        }

        this.lastSl = sl;
    }

    getDNA(){
        return this.dna;
    }

    getOffspringDNA(exploration){
        
        if(exploration == undefined)
            exploration = 3;
        
        return {
            slow:this.dna.slow + parseInt(((Math.random() * exploration * 2) - exploration)), 
            fast:this.dna.fast + parseInt(((Math.random() * exploration * 2) - exploration))
        };
    }

    static getRandomDNA(){
        let slow = parseInt(Math.random() * 90 + 30);
        return {slow: slow, fast: parseInt(slow / (1 + (Math.random() * 5)))}
    }
}