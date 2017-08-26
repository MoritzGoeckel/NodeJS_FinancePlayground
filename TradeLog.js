const chalk = require('chalk');
const columnify = require('columnify')
const stats = require("stats-lite")

const _ = require('lodash');

module.exports = class{
    constructor(){
        this.openPositions = {"LONG":null, "SHORT":null};

        this.history = [];

        this.checkType = function(type){
            if(type != "LONG" && type != "SHORT")
                throw(type + " is not a valid position type!");
        }

        this.getProfit = function(trade){
            let difference = trade.cPrice - trade.oPrice;
            if(trade.type == "SHORT")
                difference = -difference;
            return difference;
        }
    }

    openPosition(type, price, time, comment){
        this.checkType(type)

        let position = {type: type, oPrice: price, oTime: time, oComment: comment};
        
        if(this.openPositions[type] == null)
            this.openPositions[type] = position;
        else
            throw("Already open!");
    }

    closePosition(type, price, time, comment){
        this.checkType(type)

        if(this.openPositions[type] != null){
            let position = this.openPositions[type];
            position.cPrice = price;
            position.cTime = time;
            position.cComment = comment;
            this.history.push(position);
            this.openPositions[type] = null;
        }
        else
            throw("Not open!");
    }

    isPositionOpen(type){
        this.checkType(type)

        return this.openPositions[type] != null;
    }

    closeAll(bid, ask, time, comment){
        if(this.isPositionOpen("LONG"))
            this.closePosition("LONG", bid, time, comment);

        if(this.isPositionOpen("SHORT"))
            this.closePosition("SHORT", ask, time, comment);
    }

    getHistory(){
        return this.history;
    }

    printHistory(){
        let allLines = [];
        this.history.forEach(trade => {
            let p = parseInt(this.getProfit(trade) * 1000000) / 1000000;
            allLines.push({
                "TYPE": trade.type, 
                "PROFIT": (this.getProfit(trade) > 0 ? chalk.white.bgGreen(" " + p) : chalk.white.bgRed(p)), 
                "DURATION": ((new Date(trade.cTime) - new Date(trade.oTime)) / 1000 / 60) + "min",
                "IN/OUT": trade.oPrice + " -> " + trade.cPrice                
            });
        })

        console.log(columnify(allLines));
    }

    printStats(){
        let stats = this.getTradeStats();
        stats.profit = (stats.profit > 0 ? chalk.white.bold.bgGreen(stats.profit) : chalk.white.bold.bgRed(stats.profit))
        console.log(columnify(stats));
    }

    getOverallProfit(){
        return this.getTradeStats().profit;
    }

    getTradeStats(){
        if(this.stats == undefined || this.stats.trades != this.history.length){
            let tradeOutcomes = [];
            let negativeOutcomes = [];

            this.history.forEach(trade => {
                let p = this.getProfit(trade);
                if(p < 0)
                    negativeOutcomes.push(p);

                tradeOutcomes.push(p);
            });
            
            this.stats = {trades:this.history.length, profit:stats.sum(tradeOutcomes), mean:stats.mean(tradeOutcomes), median:stats.median(tradeOutcomes), std:stats.stdev(tradeOutcomes), positive:Math.floor((this.history.length - negativeOutcomes.length) / this.history.length * 100) / 100, semistd:stats.stdev(negativeOutcomes), semivar:stats.variance(negativeOutcomes)};            
            this.stats.semisharpe = this.stats.profit / this.stats.semistd;
            this.stats.sharpe = this.stats.profit / this.stats.std;            
        }

        return _.cloneDeep(this.stats);
    }
}