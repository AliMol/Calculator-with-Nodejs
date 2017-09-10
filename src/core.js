module.exports = function() {
  "use strict";

  var _ = require('underscore');

  /*Format the output string*/
  var format = function(product, winningSelections, dividend) {
    return [product, winningSelections.join(','), '$' + dividend].join(':');
  };

  /* This function is for :
  * 1 - Calculate the stakes
    2 - Calculate the total
    3 - Minus the commission for tabcorp
    4 - Divide by total stakes
    */
  var dividend = function(bets, result, correct, divideBy, minusCommission) {
    return round(divideBy(minusCommission(total(stakes(bets)))) /
        total(stakes(correct(bets))));
  };

  /*Calculate the total*/
  var total = function(collection) {
    return _.reduce(collection, function(memo, num) {
      return memo + num;
    }, 0);
  };

  /*Calculate the division*/
  var divideBy = function(denominator) {
    return function(numerator) {
      return numerator / denominator;
    };
  };

  /*Calculate the Commission*/
  var minusCommission = function(percent) {
    return function(value) {
      return value * ((100 - percent) / 100);
    };
  };

  /*return the first correct win in Win Product*/
  var correctWins = function(result) {
    return function(bets) {
      return Array.prototype.filter.call(bets, function(bet) {
        return selection(bet) === first(result);
      });
    };
  };

  /*return the correct places in Place Product*/
  var correctPlaces = function(placement, result) {
    return function(bets) {
      return Array.prototype.filter.call(bets, function(bet) {
        return selection(bet) === placement;
      });
    };
  };

  /*return the first and second places in Exacta Product*/
  var correctExactas = function(result) {
    return function(bets) {
      return Array.prototype.filter.call(bets, function(bet) {
        return _.isEqual(selections(bet), [first(result), second(result)]);
      });
    };
  };

  /*Set the Wins*/
  var wins = function(bets) {
    return _.filter(bets, isWin);
  };

  /*Set the places*/
  var places = function(bets) {
    return _.filter(bets, isPlace);
  };

  /*Set the exactas*/
  var exactas = function(bets) {
    return _.filter(bets, isExacta);
  };

  /*Define whether the product is Win*/
  var isWin = function(bet) {
    return product(bet) === 'W';
  };

  /*Define whether the product is Place*/
  var isPlace = function(bet) {
    return product(bet) === 'P';
  };

  /*Define whether the product is Exacta*/
  var isExacta = function(bet) {
    return product(bet) === 'E';
  };

  /*Get all the inputs that are bet*/
  var bets = function(input) {
    return _.filter(input, isBet);
  };

  /*Get only the first item in the inputs that is result*/
  var result = function(input) {
    return _.first(_.filter(input, isResult));
  };

  /*Define whether the input item is Bet*/
  var isBet = function(input) {
    return type(input) === 'Bet';
  };

  /*Define whether the input item is Result*/
  var isResult = function(input) {
    return type(input) === 'Result';
  };

  /*Define the type*/
  var type = function(input) {
    return _.first(split(input));
  };

  /*Define the product : W , P or E*/
  var product = function(bet) {
    return split(bet)[1];
  };

  /*split the items in the collection by ',' */
  var selections = function(bet) {
    return selection(bet).split(',');
  };

  /*returns the third item in the selection */
  var selection = function(bet) {
    return split(bet)[2];
  };

  /*returns the stake for each bet in the array */
  var stakes = function(bets) {
    return _.map(bets, stake);
  };

  /*Calculate the stake */
  var stake = function(bet) {
    return parseInt(split(bet)[3], 10);
  };

  /*Return the first Item in the array*/
  var first = function(result) {
    return split(result)[1]
  };

  /*Return the Second Item in the array*/
  var second = function(result) {
    return split(result)[2]
  };

  /*Return the third Item in the array*/
  var third = function(result) {
    return split(result)[3]
  };

  /*Return first , second and third item from the result*/
  var placements = function(result) {
    return [first(result), second(result), third(result)];
  };

  /*Split the input string by :*/
  var split = function(input) {
    return input.split(':')
  };

  /*Round the number by 2 digits*/
  var round = function(value) {
    return +value.toFixed(2);
  };

  /*This function calculates the Wins :
  * 1 - It returns the first Item from correct Wins as the winner
  * 2 - Minus the commission for the tabcorp */
  var processWins = function(bets, result) {
    return [format(
      "Win",
      [first(result)],
      dividend(wins(bets), result, correctWins(result), divideBy(1), minusCommission(15))
    )];
  }

  /*This function calculates the Places :
   * 1 - It returns the first 3 Items from correct Places as the winner
   * 2 - Divide it by 3
   * 3 - Minus the commission for the tabcorp */
  var processPlaces = function(bets, result) {
    return Array.prototype.map.call(placements(result), function(placement) {
      return format(
        "Place",
        [placement],
        dividend(places(bets), result, correctPlaces(placement), divideBy(3), minusCommission(12))
      );
    });
  };

  /*This function calculates the Places :
   * 1 - It returns the first & second Item from correct Exactas as the winner
   * 2 - Minus the commission for the tabcorp */
  var processExactas = function(bets, result) {
    return [format(
      "Exacta",
      [first(result), second(result)],
      dividend(exactas(bets), result, correctExactas(result), divideBy(1), minusCommission(18))
    )];
  };

  /* Call three functions to processWins , processPlaces & processExactas */
  var process = function (input) {
    return Array.prototype.reduce.call([
      processWins, processPlaces, processExactas
    ], function(memo, cb) {
      Array.prototype.push.apply(memo, cb(bets(input), result(input)));

      return memo;
    }, []);
  };

  return {
    process: process,
    dividend: dividend,
    total: total,
    minusCommission: minusCommission,
    divideBy: divideBy,
    correctWins: correctWins,
    correctPlaces: correctPlaces,
    correctExactas: correctExactas,
    wins: wins,
    places: places,
    exactas: exactas,
    isWin: isWin,
    isPlace: isPlace,
    isExacta: isExacta,
    bets: bets,
    result: result,
    isBet: isBet,
    isResult: isResult,
    type: type,
    product: product,
    selections: selections,
    selection: selection,
    stakes: stakes,
    stake: stake,
    first: first,
    second: second,
    third: third,
    placements: placements,
    split: split,
    round: round,
    processWins: processWins,
    processPlaces: processPlaces,
    processExactas: processExactas
  };
}();
