const ATR = require('technicalindicators').ATR

var atr = new ATR({period : 14, high : [], low:[], close:[]});


var result = atr.nextValue({
    close: 10,
    high: 7,
    low: 5
  });

  console.log(result)