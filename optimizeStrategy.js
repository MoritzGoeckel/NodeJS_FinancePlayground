const TradeLog = require("./TradeLog.js");
const executeStrategy = require("./executeStrategy.js");

const clui = require('clui');
const Progress = clui.Progress;

const logUpdate = require('log-update');

var RunningAverage = require('running-average');

module.exports = function(candles, strategyType, iterations, scoreFunction){
    const survivorsCount = 15;
    const offspringExploration = 20;
    const maximumOffspringCount = 3;
    const maxAttemptsRandom = 3;
    const randomsPerGenerationPerWinningDNA = 1;

    let doneStrategies = {};

    let bestStrategies = [];
    let dnaQueue = [];

    var thisProgressBar = new Progress(20);
    var runningAverage = new RunningAverage();
    
    console.log("Starting optimization...")

    for(let round = 0; round < iterations; round++)
    {
        let timeAtStart = new Date();
        logUpdate(thisProgressBar.update(round + 1, iterations) + " Round " + round + "/" + iterations + "  DNAinQ: " + dnaQueue.length + "    Rounds/Min: " + Math.round(60 * 1000 / runningAverage.getAverage()));        

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
        if(isNaN(score) == false && (bestStrategies.length < survivorsCount || bestStrategies[bestStrategies.length - 1].score < score)){
            bestStrategies.push({score: score, dna:result.strategy.getDNA(), instance:result.strategy});
            bestStrategies.sort((a, b) => {return (a.score < b.score ? 1 : -1)});
            while(bestStrategies.length > survivorsCount)
                bestStrategies.pop();
        }

        let elapsed = new Date() - timeAtStart;
        runningAverage.push(elapsed);
    }

    bestStrategies.forEach(strategy => {delete strategy.instance;})

    return bestStrategies;
}