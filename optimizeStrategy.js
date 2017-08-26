const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");

const clui = require('clui');
const Progress = clui.Progress;

const logUpdate = require('log-update');

module.exports = function(candles, strategyType, iterations, scoreFunction){
    const survivorsCount = 10;
    const offspringExploration = 20;
    const maximumOffspringCount = 3;
    const maxAttemptsRandom = 3;
    const randomsPerGenerationPerWinningDNA = 1;

    let doneStrategies = {};

    let bestStrategies = [];
    let dnaQueue = [];

    var thisProgressBar = new Progress(20);

    for(let round = 0; round < iterations; round++)
    {
        logUpdate(thisProgressBar.update(round + 1, iterations) + " Round " + round + "/" + iterations + "   DNA in Q: " + dnaQueue.length);        

        //### ggf build new dnaQueue
        if(dnaQueue.length == 0){
            //Winners
            for(let winner = 0; winner < bestStrategies.length; winner++){
                let offspringCount = parseInt(Math.random() * (maximumOffspringCount + 1));
                for(let i = 0; i < offspringCount; i++){
                    let dna = bestStrategies[winner].instance.getOffspringDNA(offspringExploration);
                    for(let attempts = 0; attempts < maxAttemptsRandom && doneStrategies[JSON.stringify(dna)] != undefined; attempts++)
                        dna = bestStrategies[winner].instance.getOffspringDNA(offspringExploration);
                    
                    if(doneStrategies[JSON.stringify(dna)] == undefined){
                        dnaQueue.push(dna);
                        doneStrategies[JSON.stringify(dna)] = true;
                    }
                }
            }

            let winnerDNACount = dnaQueue.length + 1;

            //Randoms
            for(let i = 0; i < parseInt(winnerDNACount * randomsPerGenerationPerWinningDNA); i++){
                let dna = strategyType.getRandomDNA();
                for(let attempts = 0; attempts < maxAttemptsRandom && doneStrategies[JSON.stringify(dna)] != undefined; attempts++)
                    dna = strategyType.getRandomDNA();

                if(doneStrategies[JSON.stringify(dna)] == undefined){
                    dnaQueue.push(dna);
                    doneStrategies[JSON.stringify(dna)] = true;          
                }      
            }
        }
        
        //### Create strategy
        let result = executeStrategy(candles, strategyType, dnaQueue.shift());

        //### Insert into bests
        let score = scoreFunction(result.tradeLog);
        if(bestStrategies.length < survivorsCount || bestStrategies[bestStrategies.length - 1].score < score){
            bestStrategies.push({score: score, dna:result.strategy.getDNA(), instance:result.strategy});
            bestStrategies.sort((a, b) => {return (a.score < b.score ? 1 : -1)});
            while(bestStrategies.length > survivorsCount)
                bestStrategies.pop();
        }
    }

    bestStrategies.forEach(strategy => {delete strategy.instance;})

    return bestStrategies;
}