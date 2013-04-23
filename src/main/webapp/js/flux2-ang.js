var live = false;

function AppCtrl($scope, $routeParams, $http) {
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	$scope.refreshCounter = 0;
	
	$scope.profitTarget = 0.05;
	$scope.rateBuffer = 0.001;
	$scope.tradeChunk = 10;

	$scope.buyCeiling = 2.0;
	$scope.sellFloor = 2.0;
	$scope.entryRate = 2.0;
	
	$scope.usd = 0;
	$scope.ltc = 0;
	$scope.unusedUsd = 0;
	$scope.unusedLtc = 0;
	$scope.usdRevenue = 0;
	
	$scope.currentPrice = 0;
	$scope.oldPrice = 0;
	$scope.currentBuyPrice = 0;
	$scope.currentSellPrice = 0;
	$scope.rateChange = 0;
	$scope.cashoutRate = 1;
	
	$scope.tradeAuto = true;
	
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	$scope.buyLtc = 0;
	$scope.buyUsd = 0;
	$scope.sellLtc = 0;
	$scope.sellUsd = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	$scope.testHistory = {
		transactions: { "buy": [], "sell": [] },
		usdRevenue: 0,
		ltc: 0,
		usd: 0
	};
	
	$scope.liveHistory = {
		transactions: { "buy": [], "sell": [] },
		usdRevenue: 0
	};
	
	$scope.history = undefined;
	
	$scope.buyHistory = [];
	$scope.sellHistory = [];
	
	$scope.init = function() {
		delete localStorage.buyHistory;
		delete localStorage.sellHistory;
		delete localStorage.usd;
		delete localStorage.ltc;
	};
	
	$scope.start = function() {
		
		console.log("starting...");
		
		if(live) {
			
			$scope.refreshInterval = 15;
			
			if(localStorage.liveHistory != undefined) {
				$scope.liveHistory = JSON.parse(localStorage.liveHistory);
				$scope.usdRevenue = parseFloat($scope.liveHistory.usdRevenue);
			}
			
			$scope.history = $scope.liveHistory;
			
			$scope.refresh();
		
		} else {
			
			$scope.refreshInterval = 1;
			
			if(localStorage.testHistory != undefined) {
				$scope.testHistory = JSON.parse(localStorage.testHistory);
				$scope.usd = parseFloat($scope.testHistory.usd);
				$scope.ltc = parseFloat($scope.testHistory.ltc);
				$scope.usdRevenue = parseFloat($scope.testHistory.usdRevenue);
			} else {
				$scope.usd = 80;
				$scope.ltc = 40;
			}
			
			$scope.history = $scope.testHistory;
			
			$scope.currentBuyPrice = 2.0; //0.5 + Math.random()*4;
			$scope.currentSellPrice = $scope.currentBuyPrice - 0.02;
			$scope.currentPrice = $scope.currentBuyPrice - 0.01;
			$scope.oldPrice = $scope.currentPrice;
		
		}
		
		$scope.intervalIds.counter = setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshCounter--; 
			});
		}, 1000);
		
		$scope.intervalIds.loop = setInterval( function() { 
			$scope.$apply( function() {
				$scope.loop();
			});
		}, $scope.refreshInterval*1000);
		
		
	
	};
	
	$scope.stop = function() {
		
		console.log("stopping...");
		
		clearInterval($scope.intervalIds.counter);
		clearInterval($scope.intervalIds.loop);
		
	}
	
	$scope.loop = function() {
		
		if(live) {
			$scope.refresh();
		} else {
			$scope.update();
		}

	};
	
	$scope.refresh = function() {
		
		if(live) {
			$scope.refreshCounter = $scope.refreshInterval;
		}
		
		API.getInfo(function(info) {
			
			if(info.success == 1) {
				$scope.ltc = info.return.funds.ltc;
				$scope.usd = info.return.funds.usd;
			} else {
				console.log(info);
				_nonce = Math.round((new Date()).getTime() / 10000);
			}
			
		});
		
		$http.get("service/rates").success(
			
			function(data)  { 
				
				$scope.currentPrice = data.ticker.last;
				$scope.currentBuyPrice = data.ticker.buy;
				$scope.currentSellPrice = data.ticker.sell;
				
				if($scope.oldPrice == 0) {
					$scope.oldPrice = $scope.currentPrice;
				}
				
				$scope.update();
					
			}
			
		);
			
	
	};
	
	
	$scope.update = function() {
	
		if(!live) {
			$scope.refreshCounter = $scope.refreshInterval;
		}
		
		$scope.rateChange = $scope.currentPrice - $scope.oldPrice;
		//console.log($scope.currentPrice+" - "+$scope.oldPrice+" = "+$scope.rateChange);
		
		var reversibleBuys = $scope.getReversibleBuys();
		var reversibleSells = $scope.getReversibleSells();
		
		for(var i=0; i<reversibleBuys.length; i++) {
			var reversibleBuy = reversibleBuys[i];
			$scope.reverseTrade(reversibleBuy, false);
		}
		
		for(var i=0; i<reversibleSells.length; i++) {
			var reversibleSell = reversibleSells[i];
			$scope.reverseTrade(reversibleSell, false);
		}
		
		
		if(reversibleBuys.length == 0 && reversibleSells.length == 0) {
			
			var tradeChunk = parseFloat($scope.tradeChunk);
			
			if($scope.currentSellPrice - $scope.highestSell() >= parseFloat($scope.profitTarget) && 
				$scope.ltc >= tradeChunk && $scope.currentSellPrice > $scope.sellFloor) {
				
				var sellTransaction = $scope.createTransaction(tradeChunk, $scope.actualTradeRate("sell"), "sell", 1);
				$scope.performTransaction(sellTransaction, true, function() {});
				$scope.oldPrice = $scope.currentPrice;
			
			} else if($scope.currentBuyPrice - $scope.lowestBuy() <= 
				-(parseFloat($scope.profitTarget)*1) && $scope.currentBuyPrice < $scope.buyCeiling &&
				$scope.usd >= (tradeChunk * $scope.actualTradeRate("buy"))) {
			
				var buyTransaction = $scope.createTransaction(tradeChunk, $scope.actualTradeRate("buy"), "buy", 1);
				$scope.performTransaction(buyTransaction, true, function() {});
				$scope.oldPrice = $scope.currentPrice;
				
			}
			
		}
		
			
	};
	
	
	$scope.lowestBuy = function() {
		
		var buyTransactions;
		var lowest = 99;
		
		if(live) {
			buyTransactions = $scope.liveHistory.transactions["buy"];
		} else {
			buyTransactions = $scope.testHistory.transactions["buy"];
		}
		
		if(buyTransactions.length == 0) {
			return $scope.oldPrice;
		}
		
		for(var i=0; i<buyTransactions.length; i++) {
			var buyTransaction = buyTransactions[i];
			if(buyTransaction.rate < lowest) {
				lowest = buyTransaction.rate;
			}
		}
		
		return lowest;
		
	};
	
	
	$scope.highestSell = function() {
		
		var sellTransactions;
		var highest = 0;
		
		if(live) {
			sellTransactions = $scope.liveHistory.transactions["sell"];
		} else {
			sellTransactions = $scope.testHistory.transactions["sell"];
		}
		
		if(sellTransactions.length == 0) {
			return $scope.oldPrice;
		}
		
		for(var i=0; i<sellTransactions.length; i++) {
			var sellTransaction = sellTransactions[i];
			if(sellTransaction.rate > highest) {
				highest = sellTransaction.rate;
			}
		}
		
		return highest;
		
	};
	
	
	$scope.getReversibleSells = function() {
   		
		var transactions;
		
		if(live) {
			transactions = $scope.liveHistory.transactions["sell"];
		} else {
			transactions = $scope.testHistory.transactions["sell"];
		}
		
		var calculatedBuyAmount = 0;
		
		var usedUsd = 0;
		
		var reversibleTransactions = [];
		
		for(var i=0; i<transactions.length; i++) {
			
			var transaction = transactions[i];
			var rateVal = parseFloat(transaction.rate);
			var amountVal = parseFloat(transaction.amount);
			var usdAmount = amountVal * rateVal;
			
			//console.log(rateVal+" * "+amountVal+" = "+usdAmount);
			
			if($scope.currentBuyPrice <= (rateVal - parseFloat($scope.profitTarget))) {
					
				var actualBuyRate = $scope.actualTradeRate("buy");
				
				var newBuyAmount = 
					calculatedBuyAmount + amountVal; // (usdAmount / actualBuyRate); //
					
				if($scope.usd > (newBuyAmount * actualBuyRate)) {
					calculatedBuyAmount = newBuyAmount;
					reversibleTransactions.push(transaction);
					console.log("buy "+amountVal+" for "+(amountVal * actualBuyRate));
				} else {
					console.log("OUT OF USD!");
					break;
				}
				
			} else {
				
				usedUsd += usdAmount;
				
			}
				
		}
		
		$scope.unusedUsd = $scope.usd - usedUsd;
			
		return reversibleTransactions;
			
	};
		
	
	$scope.getReversibleBuys = function() {
	   	
		var transactions;
		
		if(live) {
			transactions = $scope.liveHistory.transactions["buy"];
		} else {
			transactions = $scope.testHistory.transactions["buy"];
		}
		
		var calculatedSellAmount = 0;
		var usedLtc = 0;
		
		var reversibleTransactions = [];
		
		for(var i=0; i<transactions.length; i++) {
			
			var transaction = transactions[i];
			var rateVal = parseFloat(transaction.rate);
			var amountVal = parseFloat(transaction.amount);
			
			//console.log($scope.currentSellPrice+" >= "+(priceVal + $scope.profitTarget));
			//console.log($scope.currentSellPrice >= (priceVal + $scope.profitTarget));
			
			if($scope.currentSellPrice >= (rateVal + parseFloat($scope.profitTarget))) {
				
				var actualSellRate = $scope.actualTradeRate("sell");
				var newSellAmount = calculatedSellAmount + amountVal;
				
				if($scope.ltc > newSellAmount) {
					calculatedSellAmount = newSellAmount;
					reversibleTransactions.push(transaction);
					console.log("sell "+amountVal+" for "+(amountVal * actualSellRate));
				} else {
					console.log("OUT OF LTC!");
					break;
				}
					
			} else {
				
				usedLtc += amountVal;
				
			}
				
					
		}
		
		$scope.unusedLtc = $scope.ltc - usedLtc;
		
		return reversibleTransactions;
			
	};
	
	
	$scope.manualTransaction = function(type) {
		
		var amount;
		var rate;
		
		if(type == "buy") {
			rate = $scope.manualBuyRate;
			amount = $scope.buyLtc;
		} else if(type == "sell") {
			rate = $scope.manualSellRate;
			amount = $scope.sellLtc;
		}
		
		var transaction = $scope.createTransaction(amount, rate, type, 1);
		
		$scope.performTransaction(transaction, $scope.trackManualTransactions, function() {
			
		});
		
	}
	
	$scope.reverseTrade = function(transaction, save) {
		
		console.log("reverse trading...");
		
		var transactionIndex; 
		
		if(live) {
			transactionIndex = $scope.transactionIndex($scope.liveHistory.transactions[transaction.type], transaction);
		} else {
			transactionIndex = $scope.transactionIndex($scope.testHistory.transactions[transaction.type], transaction);
		}
		
		console.log(transactionIndex + "/"+save);
		console.log(transaction);
		
		var reverseTransaction = $scope.createReverseTransaction(transaction);
		
		$scope.performTransaction(reverseTransaction, save, function() {
			
			$scope.removeTransaction(transaction);
			
			var transactionRevenue;
			
			if(reverseTransaction.type == "sell") {
				
				transactionRevenue = 
					(reverseTransaction.amount*reverseTransaction.rate) - (transaction.amount*transaction.rate);
			
			} else if(reverseTransaction.type == "buy") {
				
				transactionRevenue = 
					(transaction.amount*transaction.rate) - (reverseTransaction.amount*reverseTransaction.rate);
				
			}
				
			$scope.usdRevenue += transactionRevenue;
				
			if(live) {
				$scope.liveHistory.usdRevenue = $scope.usdRevenue;
			} else {
				$scope.testHistory.usdRevenue = $scope.usdRevenue;
			}
			
			
		});
		
		
	};
	
	
	$scope.createReverseTransaction = function(transaction) {
		
		var reverseType;
		
		if(transaction.type == "sell") {
			reverseType = "buy";
		} else if(transaction.type == "buy") {
			reverseType = "sell";
		}
		
		console.log("REVERSED TYPE TO "+reverseType);
		
		return $scope.createTransaction(transaction.amount, $scope.actualTradeRate(reverseType), reverseType, 1);
		
	};
	
	$scope.createTransaction = function(amount, rate, type, ttl) {
		
		var transaction = { 
				
				time: (new Date()).getTime(),
				rate: rate, 
				amount: amount,
				type: type,
				ttl: ttl
		
		};
		
		return transaction;
		
	};
	
	
	$scope.performTransaction = function(transaction, save, performed) {
		
		var actualTradeRate = $scope.actualTradeRate(transaction.type);
		
		if(live) {
			
			API.trade("ltc_usd", ""+transaction.type, ""+actualTradeRate, ""+transaction.amount, function(order) {
				
				console.log(order);
			
				if(order.success == 1) {
					
					performed();
					
					if(save) {
						$scope.logTransaction(transaction);
					}
				
				} else {
					
					_nonce = Math.round((new Date()).getTime() / 10000);
					
				}
				
			});
			
		} else {
		
			if(transaction.type == "buy") {
				
				$scope.usd -= transaction.amount * actualTradeRate;
				$scope.ltc += transaction.amount;
				
			} else if(transaction.type == "sell") {
				
				$scope.usd += transaction.amount * actualTradeRate;
				$scope.ltc -= transaction.amount;
				
			}
			
			$scope.testHistory.usd = $scope.usd;
			$scope.testHistory.ltc = $scope.ltc;
			
			performed();
			
			if(save) {
				$scope.logTransaction(transaction);
			}
			
			
		}
			
			
	};
	
	
	$scope.logTransaction = function(transaction) {
		
		if(live) {
			$scope.liveHistory.transactions[transaction.type].push(transaction);
		} else {
			$scope.testHistory.transactions[transaction.type].push(transaction);
			console.log($scope.testHistory);
		}
		
		var historyJson = $scope.saveHistory();
		
		console.log("saved "+transaction.type+" transaction to history: "+historyJson);
		
	};
	
	
	$scope.saveHistory = function() {
		
		var historyJson;
		
		if(live) {
			historyJson = JSON.stringify($scope.liveHistory);
			localStorage.liveHistory = historyJson;
		} else {
			historyJson = JSON.stringify($scope.testHistory);
			localStorage.testHistory = historyJson;
		}
		
		return historyJson;
		
	}
	
	
	$scope.removeTransaction = function(transaction) {
		
		if(live) {
			var transactionIndex = $scope.transactionIndex($scope.liveHistory.transactions[transaction.type], transaction);
			$scope.liveHistory.transactions[transaction.type].splice(transactionIndex, 1);
		} else {
			var transactionIndex = $scope.transactionIndex($scope.testHistory.transactions[transaction.type], transaction);
			$scope.testHistory.transactions[transaction.type].splice(transactionIndex, 1);
		}
		
		$scope.saveHistory();
		
	}
	
	$scope.transactionIndex = function(transactions, transaction) {
		
		for(var i=0; i<transactions.length; i++) {
			var t = transactions[i];
			if(t.time == transaction.time) {
				return i;
			}
		}
		
		return -1;
		
	}
	
	$scope.changeProfitFormat = function(type) {
		if(type == "buy") {
			$scope.buyProfitFormat = $scope.otherProfitFormat(type);
		} else if(type == "sell") {
			$scope.sellProfitFormat = $scope.otherProfitFormat(type);
		}
	}
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == 'buy') {
			return $scope.currentBuyPrice - parseFloat($scope.rateBuffer);
		} else if(type == 'sell') {
			return $scope.currentSellPrice + parseFloat($scope.rateBuffer);
		}
		
	}
	
	$scope.buyProfit = function(buy) {
		
		if($scope.buyProfitFormat == "%") {
			return 100*(1-(buy.rate / ($scope.actualTradeRate("sell"))));
		} else if($scope.buyProfitFormat == "$") {
			return (buy.amount*$scope.actualTradeRate("sell")) - (buy.amount*buy.rate); 
		}
		
	};
	
	$scope.sellProfit = function(sell) {
		
		if($scope.sellProfitFormat == "%") {
			return 100*((sell.rate / ($scope.actualTradeRate("buy")))-1);
		} else if($scope.sellProfitFormat == "$") {
			return (sell.amount*sell.rate) - (sell.amount*$scope.actualTradeRate("buy")); 
		}
		
	};
	
	
	$scope.ltcCashout = function() {
		return $scope.ltc + ($scope.usd / $scope.actualTradeRate("buy"));
	};
	
	$scope.usdCashout = function() {
		return $scope.usd + ($scope.ltc * $scope.actualTradeRate("sell"));
	};
	
	$scope.fixedLtcCashout = function() {
		return $scope.ltc + ($scope.usd / $scope.cashoutRate);
	};
	
	$scope.fixedUsdCashout = function() {
		return $scope.usd + ($scope.ltc * $scope.cashoutRate);
	};
	
	$scope.otherProfitFormat = function(type) {
		
		var profitFormat;
		
		if(type == "buy") {
			profitFormat = $scope.buyProfitFormat;
		} else if(type == "sell") {
			profitFormat = $scope.sellProfitFormat;
		}
		
		if(profitFormat == "$") {
			return "%";
		} else if(profitFormat == "%") {
			return "$";
		}
		
	};
	
	
	/* Test mode methods */
	
	$scope.raisePrice = function() {
		
		var random = true;
		
		if(random) {
			$scope.currentSellPrice += parseFloat(Math.random()*0.01);
			$scope.currentBuyPrice = $scope.currentSellPrice + parseFloat(0.005 * Math.random());
			$scope.currentPrice = $scope.currentSellPrice + parseFloat(0.00025 * Math.random());
		} else {
			$scope.currentSellPrice += 0.1000;
			$scope.currentBuyPrice = $scope.currentSellPrice;
			$scope.currentPrice = $scope.currentSellPrice;
		}
		
	};
		
	$scope.lowerPrice = function() {
		
		var random = true;
		
		if(random) {
			var priceChange = -parseFloat(Math.random()*0.01);
			if($scope.currentSellPrice + priceChange > 0.1) {
				$scope.currentSellPrice += priceChange;
				$scope.currentBuyPrice = $scope.currentSellPrice + parseFloat(0.005 * Math.random());
				$scope.currentPrice = $scope.currentSellPrice + parseFloat(0.00025 * Math.random());
			}
		} else {
			$scope.currentSellPrice -= 0.1000;
			$scope.currentBuyPrice = $scope.currentSellPrice;
			$scope.currentPrice = $scope.currentSellPrice;
		}
				
	};
	
	$scope.removeMoney = function() {
		
		$scope.usd -= 10;
		$scope.testHistory.usd = $scope.usd;
		$scope.saveHistory();
	
	};
	
	$scope.addMoney = function() {
		
		$scope.usd += 10;
		$scope.testHistory.usd = $scope.usd;
		$scope.saveHistory();
	
	};
	
	$scope.removeCoins = function() {
		
		$scope.ltc -= 10;
		$scope.testHistory.ltc = $scope.ltc;
		$scope.saveHistory();
	
	};
	
	$scope.addCoins = function() {
		
		$scope.ltc += 10;
		$scope.testHistory.ltc = $scope.ltc;
		$scope.saveHistory();
	
	};
	
	
	/* Variable properties */
	
	$scope.showAutoTrading = true;
	$scope.showManualTrading = true;
	
	$scope.buySort = $scope.buyProfit;
	$scope.buySortReverse = true;
	
	$scope.sellSort = $scope.sellProfit;
	$scope.sellSortReverse = true;
	
	$scope.buyProfitFormat = "%";
	$scope.sellProfitFormat = "%";
	
	
	
	/* Watchers */
	
	$scope.firstPassConvert = true;
	
	$scope.$watch('buyLtc', function(value) {
		
	    if (value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var usd = $scope.truncate(parseFloat(value)*$scope.manualBuyRate, 6);
	    		$scope.buyUsd = usd;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('buyUsd', function(value) {
		
		if (value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var ltc = $scope.truncate(parseFloat(value)/$scope.manualBuyRate, 6);
				$scope.buyLtc = ltc;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('sellLtc', function(value) {
		
	    if (value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var usd = $scope.truncate(parseFloat(value)*$scope.manualSellRate, 6);
	    		$scope.sellUsd = usd;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('sellUsd', function(value) {
		
		if (value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var ltc = $scope.truncate(parseFloat(value)/$scope.manualSellRate, 6);
				$scope.sellLtc = ltc;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('currentBuyPrice', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.currentBuyPrice, 6);
	    }
		
	}, true);
	
	$scope.$watch('currentSellPrice', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.currentSellPrice, 6);
	    }
		
	}, true);
	
	$scope.truncate = function(val, length) {
		
		val = ""+val;
		
		if(val.length > length) {
			val = val.substring(0, length);
		}
		
		return parseFloat(val);
		
	}
	
	
	
};

angular.module('myApp', ['filters']);

angular.module('filters', []).filter('truncate', function () {
    
	return function (text, length, end) {
		
		text = ""+text;
		
		if(isNaN(length))
			length = 10;

        if(end === undefined)
        	end = "...";

        if(text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
});
