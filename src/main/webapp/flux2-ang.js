var live = false;

function AppCtrl($scope, $routeParams, $http) {
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 1;
	$scope.refreshCounter = 0;
	
	$scope.leverage = 40;
	$scope.profitTarget = 0.1;
	$scope.aggressivity = 0.5;
	$scope.rateBuffer = 0;
	$scope.tradeChunk = 10;
	
	$scope.usd = 0;
	$scope.ltc = 0;
	$scope.unusedUsd = 0;
	$scope.unusedLtc = 0;
	
	$scope.currentPrice = 0.11;
	$scope.currentBuyPrice = 0.11;
	$scope.currentSellPrice = 0.11;
	$scope.rateChange = 0;
	
	$scope.buyHistory = [];
	$scope.sellHistory = [];
	
	$scope.init = function() {
		delete localStorage.buyHistory;
		delete localStorage.sellHistory;
		delete localStorage.usd;
		delete localStorage.ltc;
	};
	
	$scope.start = function() {
		
		
		if(localStorage.buyHistory != undefined) {
			$scope.buyHistory = JSON.parse(localStorage.buyHistory);
		}
		
		if(localStorage.sellHistory != undefined) {
			$scope.sellHistory = JSON.parse(localStorage.sellHistory);
		}
		
		
		console.log("starting");
		
		if(live) {
			$scope.refresh();
		} else {
			
			if(localStorage.usd != undefined) {
				$scope.usd = parseFloat(localStorage.usd);
			} else {
				$scope.usd = 50;
				localStorage.usd = 50;
			}
			
			if(localStorage.ltc != undefined) {
				$scope.ltc = parseFloat(localStorage.ltc);
			} else {
				$scope.ltc = 50;
				localStorage.ltc = 50;
			}
			
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
		
		var buyAmount = $scope.calcBuyAmount();
		var sellAmount = $scope.calcSellAmount();
		
		if(buyAmount > 0) {
			$scope.buy(buyAmount);
			$scope.oldPrice = $scope.currentPrice;
		}
		
		if(sellAmount > 0) {
			$scope.sell(sellAmount);
			$scope.oldPrice = $scope.currentPrice;
		}
		
		if(sellAmount == 0 && buyAmount == 0) {
			
			//console.log(sellAmount+"/"+buyAmount+"/"+$scope.rateChange);
			
			if($scope.rateChange >= $scope.profitTarget && $scope.unusedLtc >= $scope.tradeChunk) {
			
				sellAmount = $scope.tradeChunk;
				$scope.sell(sellAmount);
				$scope.oldPrice = $scope.currentPrice;
				console.log("old price: "+$scope.oldPrice);
			
			} else if($scope.rateChange <= -$scope.profitTarget && $scope.unusedUsd >= ($scope.tradeChunk * $scope.actualBuyPrice())) {
			
				buyAmount = $scope.tradeChunk;
				$scope.buy(buyAmount);
				$scope.oldPrice = $scope.currentPrice;
		
			}
			
		}
		
			
	};
	
	
	$scope.calcBuyAmount = function() {
   		
		var calculatedBuyAmount = 0;
		
		var usedUsd = 0;
		
		var splicedIds = [];
		
		for(var i=0; i<$scope.sellHistory.length; i++) {
			
			var entry = $scope.sellHistory[i];
			
			var priceVal = parseFloat(entry.rate);
			var amountVal = parseFloat(entry.amount);
			var usdAmount = amountVal * priceVal;
			
			if($scope.currentBuyPrice <= (priceVal - $scope.profitTarget)) {
					
				var actualBuyPrice = $scope.actualBuyPrice();
					
				var newBuyAmount = 
					calculatedBuyAmount + amountVal; //(usdAmount / actualBuyPrice);
					
				if($scope.usd > (newBuyAmount * actualBuyPrice)) {
					calculatedBuyAmount = newBuyAmount;
					splicedIds.push(i);
					console.log("buy "+amountVal+" for "+(amountVal * actualBuyPrice));
				} else {
					console.log("OUT OF COINS!");
					break;
				}
						
					
			} else {
				
				usedUsd += usdAmount;
				
			}
				
		}
		
		for(var i=0; i<splicedIds.length; i++) {
			$scope.sellHistory.splice(splicedIds[i], 1);
		}
		
		$scope.unusedUsd = $scope.usd - usedUsd;
		
		var buyAmount = 0;
			
		if(calculatedBuyAmount > 0) {
			buyAmount = calculatedBuyAmount;
		}
			
		return buyAmount;
			
	};
		
	
	$scope.calcSellAmount = function() {
	   	
		var calculatedSellAmount = 0;
		
		var usedLtc = 0;
		
		var splicedIds = [];
		
		for(var i=0; i<$scope.buyHistory.length; i++) {
			
			var entry = $scope.buyHistory[i];
			var priceVal = parseFloat(entry.rate);
			var amountVal = parseFloat(entry.amount);
			
			//console.log($scope.currentSellPrice+" >= "+(priceVal + $scope.profitTarget));
			//console.log($scope.currentSellPrice >= (priceVal + $scope.profitTarget));
			
			if($scope.currentSellPrice >= (priceVal + $scope.profitTarget)) {
				
				var actualSellPrice = $scope.actualSellPrice();
				
				var newSellAmount = calculatedSellAmount + amountVal;
					
				if($scope.ltc > newSellAmount) {
					calculatedSellAmount = newSellAmount;
					splicedIds.push(i);
					console.log("sell "+amountVal+" for "+(amountVal * actualSellPrice));
				} else {
					console.log("OUT OF USD!")
					break;
				}
					
			} else {
				
				usedLtc += amountVal;
				
			}
				
					
		}
		
		for(var i=0; i<splicedIds.length; i++) {
			$scope.buyHistory.splice(splicedIds[i], 1);
		}
		
		$scope.unusedLtc = $scope.ltc - usedLtc;
		
		var sellAmount = 0;
			
		if(calculatedSellAmount > 0) {
			sellAmount = calculatedSellAmount;
		}
		
		return sellAmount;
			
	};
	
	
	$scope.buy = function(buyAmount) {
		
		var actualRate = $scope.actualBuyPrice();
		
		if(!live) {
			
			var priceInUsd = buyAmount * actualRate;
			
			var newUsdVal = $scope.usd - priceInUsd;	
			var newLtcVal = $scope.ltc + buyAmount;
			
			$scope.usd = newUsdVal;
			$scope.ltc = newLtcVal;
			
			localStorage.usd = $scope.usd;
			localStorage.ltc = $scope.ltc;
			
			$scope.logBuy(buyAmount);
			
			return;
			
		}
		
		actualRate = ""+actualRate;
		
		buyAmount = ""+buyAmount;
		if(buyAmount.length > 6) {
			buyAmount = buyAmount.substring(0, 6);
		}
		
		API.trade("ltc_usd", "buy", actualRate, buyAmount, function(order) {
				
			console.log(order);
				
			if(order.success == 1) {
				
				$scope.logBuy(buyAmount);
				
					
			} else {
					
				_nonce = Math.round((new Date()).getTime() / 10000);
					
			}
				
		});
			
			
	};
	
	$scope.sell = function(sellAmount) {
		
		var actualRate = $scope.actualSellPrice();
		
		if(!live) {
			
			var valueInUsd = sellAmount * actualRate;
			
			var newUsdVal = $scope.usd + valueInUsd;	
			var newLtcVal = $scope.ltc - sellAmount;
			
			$scope.usd = newUsdVal;
			$scope.ltc = newLtcVal;
			
			localStorage.usd = $scope.usd;
			localStorage.ltc = $scope.ltc;
			
			$scope.logSell(sellAmount);
			
			return;
			
		}

		actualRate = ""+actualRate;
		
		sellAmount = ""+sellAmount;
		if(sellAmount.length > 6) {
			sellAmount = sellAmount.substring(0, 6);
		}
		
		API.trade("ltc_usd", "sell", actualRate, sellAmount, function(order) {
			
			console.log(order);
			
			if(order.success == 1) {
				
				$scope.logSell(sellAmount);
				
			} else {
					
				_nonce = Math.round((new Date()).getTime() / 10000);
					
			}
			
		});
			
			
	};
	
	$scope.logBuy = function(buyAmount) {
		
		var date = new Date();
		
		$scope.buyHistory.push({ rate: $scope.currentBuyPrice, amount: buyAmount });
		
		console.log("BUY HISTORY:");
		console.log($scope.buyHistory);
		console.log("SELL HISTORY:");
		console.log($scope.sellHistory);
			
		$scope.lastBuyPrice = $scope.currentBuyPrice;
		$scope.lastSellPrice = $scope.currentBuyPrice;
				
		var buyHistoryJson = JSON.stringify($scope.buyHistory);
		console.log("save sell history: "+buyHistoryJson);
		localStorage.buyHistory = buyHistoryJson;
		
	};
	
	
	$scope.logSell = function(sellAmount) {
		
		var date = new Date();
		
		$scope.sellHistory.push({ rate: $scope.currentSellPrice, amount: sellAmount });
		
		console.log("BUY HISTORY:");
		console.log($scope.buyHistory);
		console.log("SELL HISTORY:");
		console.log($scope.sellHistory);
			
		$scope.lastBuyPrice = $scope.currentSellPrice;
		$scope.lastSellPrice = $scope.currentSellPrice;
				
		var sellHistoryJson = JSON.stringify($scope.sellHistory);
		console.log("save sell history: "+sellHistoryJson);
		localStorage.sellHistory = sellHistoryJson;
		
	};
	
	$scope.actualSellPrice = function() {
		return $scope.currentSellPrice - $scope.rateBuffer;
	}
	
	$scope.actualBuyPrice = function() {
		return $scope.currentBuyPrice + $scope.rateBuffer;
	}
		
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
		localStorage.usd = $scope.usd;
		
	};
	
	$scope.addCoins = function() {
		
		$scope.ltc += 10;
		localStorage.ltc = $scope.ltc;
	
	};
	
	$scope.buyProfit = function(buy) {
		return 1.0000-(buy.rate / ($scope.actualSellPrice()));
	};
	
	$scope.sellProfit = function(sell) {
		return (sell.rate / ($scope.actualBuyPrice()))-1.0000;
	};
	
	$scope.ltcCashout = function() {
		return $scope.ltc + ($scope.usd / $scope.actualBuyPrice());
	};
	
	$scope.usdCashout = function() {
		return $scope.usd + ($scope.ltc * $scope.actualSellPrice());
	}
	
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