const chalk = require('chalk');
const columnify = require('columnify')

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

    printOverallProfit(){
        let profit = this.getOverallProfit();
        let line = "Profit: " + (profit / this.history.length) + "/T    Overall: " + profit;
        console.log((profit > 0 ? chalk.white.bold.bgGreen(line) : chalk.white.bold.bgRed(line)));
    }

    getOverallProfit(){
        let sum = 0;
        this.history.forEach(trade => {
            sum += this.getProfit(trade);
        });

        return sum;
    }
}