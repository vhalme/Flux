var live = true;

function AppCtrl($scope, $routeParams, $http) {
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	$scope.refreshCounter = 0;
	
	$scope.profitTarget = 0.026;
	$scope.rateBuffer = 0.001;
	$scope.tradeChunk = 10;
	
	$scope.usd = 0;
	$scope.ltc = 0;
	$scope.unusedUsd = 0;
	$scope.unusedLtc = 0;
	
	$scope.currentPrice = 0;
	$scope.oldPrice = 0;
	$scope.currentBuyPrice = 0;
	$scope.currentSellPrice = 0;
	$scope.rateChange = 0;
	
	$scope.cashoutRate = 1;
	
	$scope.testHistory = {
		transactions: { "buy": [], "sell": [] },
		ltc: 0,
		usd: 0
	};
	
	$scope.liveHistory = {
			transactions: { "buy": [], "sell": [] }
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
			}
			
			$scope.history = $scope.liveHistory;
			
			$scope.refresh();
		
		} else {
			
			$scope.refreshInterval = 1;
			
			if(localStorage.testHistory != undefined) {
				$scope.testHistory = JSON.parse(localStorage.testHistory);
				$scope.usd = parseFloat($scope.testHistory.usd);
				$scope.ltc = parseFloat($scope.testHistory.ltc);
			} else {
				$scope.usd = 50;
				$scope.ltc = 50;
			}
			
			$scope.history = $scope.testHistory;
			
			$scope.currentBuyPrice = 0.5 + Math.random()*4;
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
			
			//console.log(sellAmount+"/"+buyAmount+"/"+$scope.rateChange);
			
			if($scope.rateChange >= $scope.profitTarget && $scope.unusedLtc >= $scope.tradeChunk) {
				
				var sellTransaction = $scope.createTransaction($scope.tradeChunk, "sell", 1);
				$scope.performTransaction(sellTransaction, true, function() {});
				$scope.oldPrice = $scope.currentPrice;
			
			} else if($scope.rateChange <= -$scope.profitTarget && $scope.unusedUsd >= ($scope.tradeChunk * $scope.actualTradeRate("buy"))) {
			
				var buyTransaction = $scope.createTransaction($scope.tradeChunk, "buy", 1);
				$scope.performTransaction(buyTransaction, true, function() {});
				$scope.oldPrice = $scope.currentPrice;
				
			}
			
		}
		
			
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
			
			if($scope.currentBuyPrice <= (rateVal - $scope.profitTarget)) {
					
				var actualBuyRate = $scope.actualTradeRate("buy");
				
				var newBuyAmount = 
					calculatedBuyAmount + amountVal; //(usdAmount / actualBuyPrice);
					
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
			
			if($scope.currentSellPrice >= (rateVal + $scope.profitTarget)) {
				
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
		
		return $scope.createTransaction(transaction.amount, reverseType, 1);
		
	};
	
	$scope.createTransaction = function(amount, type, ttl) {
		
		var transaction = { 
				
				time: (new Date()).getTime(),
				rate: $scope.actualTradeRate(type), 
				amount: amount,
				type: type,
				ttl: ttl
		
		};
		
		return transaction;
		
	};
	
	
	$scope.performTransaction = function(transaction, save, performed) {
		
		var actualTradeRate = $scope.actualTradeRate(transaction.type);
		
		if(!live) {
			
			if(transaction.type == "buy") {
				
				$scope.usd -= transaction.amount * actualTradeRate;
				$scope.ltc += transaction.amount;
				
			} else if(transaction.type == "sell") {
				
				$scope.usd += transaction.amount * actualTradeRate;
				$scope.ltc -= transaction.amount;
				
			}
			
			$scope.testHistory.usd = $scope.usd;
			$scope.testHistory.ltc = $scope.ltc;
			
			if(save) {
				$scope.logTransaction(transaction);
			}
			
			performed();
			
			return;
			
		}

		
		API.trade("ltc_usd", transaction.type, actualTradeRate, transaction.amount, function(order) {
			
			console.log(order);
			
			if(order.success == 1) {
				
				if(save) {
					$scope.logTransaction(transaction);
				}
				
				performed();
				
			} else {
					
				_nonce = Math.round((new Date()).getTime() / 10000);
					
			}
			
		});
			
			
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
	
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == 'buy') {
			return $scope.currentBuyPrice - $scope.rateBuffer;
		} else if(type == 'sell') {
			return $scope.currentSellPrice + $scope.rateBuffer;
		}
		
	}
	
	$scope.buyProfit = function(buy) {
		return 1.0000-(buy.rate / ($scope.actualTradeRate("sell")));
	};
	
	$scope.sellProfit = function(sell) {
		return (sell.rate / ($scope.actualTradeRate("buy")))-1.0000;
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
	}
	
	
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
	
	$scope.addMoney = function() {
		
		$scope.usd += 10;
		$scope.testHistory.usd = $scope.usd;
		$scope.saveHistory();
	};
	
	$scope.addCoins = function() {
		
		$scope.ltc += 10;
		$scope.testHistory.ltc = $scope.ltc;
		$scope.saveHistory();
	
	};
	
	
	/* Variable properties */
	
	$scope.buySort = $scope.buyProfit;
	$scope.buySortReverse = true;
	
	$scope.sellSort = $scope.sellProfit;
	$scope.sellSortReverse = true;
	
	
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