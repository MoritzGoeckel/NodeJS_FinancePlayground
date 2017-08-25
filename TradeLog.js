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

    getHistory(){
        return this.history;
    }

    printHistory(){
        function getProfit(trade){
            let difference = trade.cPrice - trade.oPrice;
            if(trade.type == "SHORT")
                difference = -difference;
            return difference;
        }

        let allLines = [];
        this.history.forEach(trade => {
            allLines.push({
                "TYPE": trade.type, 
                "PROFIT": getProfit(trade), 
                "IN/OUT": trade.oPrice + " -> " + trade.cPrice, 
                "DURATION": ((new Date(trade.cTime) - new Date(trade.oTime)) / 1000 / 60) + "min",
                "RESULT": (getProfit(trade) > 0 ? chalk.green("+") : chalk.red("-"))
            });
        })

        console.log(columnify(allLines));
    }
}