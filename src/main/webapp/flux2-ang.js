var live = false;

function AppCtrl($scope, $routeParams, $http) {
	
	$scope.refreshCounter = 15;
	
	$scope.leverage = 40;
	$scope.profitTarget = 0.0000001;
	$scope.aggressivity = 0.5;
	
	$scope.usd = 0;
	$scope.ltc = 0;

	$scope.lastBuyPrice = 0;
	$scope.lastSellPrice = 0;
	
	$scope.currentBuyPrice = 0.11;
	$scope.currentSellPrice = 0.11;
	
	$scope.buyMargin = 0;
	$scope.sellMargin = 0;
	
	$scope.buyHistory = {};
	$scope.sellHistory = {};
	
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
			$scope.usd = 50;
			$scope.ltc = 50;
			$scope.currentBuyPrice = 2.36;
			$scope.currentSellPrice = 2.36;
		}
		
		setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshCounter--; 
			});
		}, 1000);
		
		setInterval( function() { 
			$scope.$apply( function() {
				$scope.loop();
			});
		}, 15000);
		
		
	
	};
	
	$scope.loop = function() {
		
		if(live) {
			$scope.refresh();
		} else {
			$scope.update();
		}

	};
	
	$scope.refresh = function() {
		
		if(live) {
			$scope.refreshCounter = 15;
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
				
				$scope.currentBuyPrice = data.ticker.buy;
				$scope.currentSellPrice = data.ticker.sell;
					
				if($scope.lastSellPrice == 0) {
					$scope.lastSellPrice = $scope.currentSellPrice;
					$scope.lastBuyPrice = $scope.currentBuyPrice;
				}
					
				if($scope.lastSellPrice == 0) {
					$scope.lastSellPrice = $scope.currentSellPrice;
					$scope.lastBuyPrice = $scope.currentBuyPrice;
				}
					
				$scope.update();
					
			}
			
		);
			
	
	};
	
	
	$scope.update = function() {
	
		if(!live) {
			$scope.refreshCounter = 15;
		}
		
		$scope.buyMargin = $scope.lastBuyPrice - $scope.currentBuyPrice;
		$scope.sellMargin = $scope.currentSellPrice - $scope.lastSellPrice;
		
		var buyAmount = $scope.calcBuyAmount();
		var sellAmount = $scope.calcSellAmount();
		
		if(buyAmount > 0) {
			$scope.buy(buyAmount);
		} else {
			if($scope.buyMargin > $scope.profitTarget && $scope.usd > 3) {
				buyAmount = ($scope.usd * $scope.aggressivity) / ($scope.currentBuyPrice + 0.01);
				$scope.buy(buyAmount);
			}
		}
		
		if(sellAmount > 0) {
			$scope.sell(sellAmount);
		} else {
			if($scope.sellMargin > $scope.profitTarget && $scope.ltc > 1) {
				sellAmount = $scope.ltc * $scope.aggressivity;
				$scope.sell(sellAmount);
			}
		}
		
			
	};
	
	
	$scope.calcBuyAmount = function() {
   		
		var calculatedBuyAmount = 0;
			
		for(var key in $scope.sellHistory) {
			
			var entry = $scope.sellHistory[key];
			
			var priceVal = parseFloat(entry.rate);
			var amountVal = parseFloat(entry.amount);
			var usdAmount = amountVal * priceVal;
				
			if($scope.currentBuyPrice <= (priceVal - $scope.profitTarget)) {
					
				var actualBuyPrice = $scope.currentBuyPrice + 0.01;
					
				var newBuyAmount = 
					calculatedBuyAmount + (usdAmount / actualBuyPrice);
					
				if($scope.usd > (newBuyAmount * actualBuyPrice)) {
					calculatedBuyAmount = newBuyAmount;
					delete $scope.sellHistory[key];
					console.log("buyFor += "+(newBuyAmount * actualBuyPrice));
				} else {
					console.log("OUT OF COINS!");
					break;
				}
						
					
			}
				
		}
			
		var buyAmount = 0;
			
		if(calculatedBuyAmount > 0) {
			buyAmount = calculatedBuyAmount;
		}
			
		return buyAmount;
			
	};
		
	
	$scope.calcSellAmount = function() {
	   	
		var calculatedSellAmount = 0;
			
		for(var key in $scope.buyHistory) {
			
			var entry = $scope.buyHistory[key];
			var priceVal = parseFloat(entry.price);
			var amountVal = parseFloat(entry.amount);
			
			if($scope.currentSellPrice >= (priceVal + $scope.profitTarget)) {
					
				console.log("YES!");
					
				var newSellAmount = calculatedSellAmount + amountVal;
					
				if($scope.ltc > newSellAmount) {
					calculatedSellAmount = newSellAmount;
					delete $scope.buyHistory[key];
					console.log("sellAmount += "+amountVal);
				} else {
					console.log("OUT OF USD!")
					break;
				}
					
			}
				
					
		}
			
		var sellAmount = 0;
			
		if(calculatedSellAmount > 0) {
			sellAmount = calculatedSellAmount;
		}
		
		return sellAmount;
			
	};
	
	
	$scope.buy = function(buyAmount) {
		
		var actualRate = $scope.currentBuyPrice + 0.01;
		
		if(!live) {
			
			var priceInUsd = buyAmount * actualRate;
			
			var newUsdVal = $scope.usd - priceInUsd;	
			var newLtcVal = $scope.ltc + buyAmount;
			
			$scope.usd = newUsdVal;
			$scope.ltc = newLtcVal;
			
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
		
		var actualRate = $scope.currentSellPrice - 0.01;
		
		if(!live) {
			
			var valueInUsd = sellAmount * actualRate;
			
			var newUsdVal = $scope.usd + valueInUsd;	
			var newLtcVal = $scope.ltc - sellAmount;
			
			$scope.usd = newUsdVal;
			$scope.ltc = newLtcVal;
			
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
		
		$scope.buyHistory[date.getTime()] = { rate: $scope.currentBuyPrice, amount: buyAmount };
		
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
		
		$scope.sellHistory[date.getTime()] = { rate: $scope.currentSellPrice, amount: sellAmount };
		
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
	
		
	$scope.raisePrice = function() {
		
		$scope.currentSellPrice += Math.random()*0.02;
		$scope.currentBuyPrice = $scope.currentSellPrice + (0.01 * Math.random());
			
	};
		
	$scope.lowerPrice = function() {
		
		$scope.currentSellPrice -= Math.random()*0.02;
		$scope.currentBuyPrice = $scope.currentSellPrice + (0.01 * Math.random());
				
	};
	
	$scope.addMoney = function() {
		
		$scope.usd += 10;
		
	};
	
	$scope.addCoins = function() {
		
		$scope.ltc += 10;
		
	};
	
	$scope.buyProfit = function(rate) {
		return 1-(rate / ($scope.currentSellPrice - 0.01));
	};
	
	$scope.sellProfit = function(rate) {
		return (rate / ($scope.currentBuyPrice + 0.01))-1;
	};
	
};

angular.module('myApp', ['filters']);

angular.module('filters', []).filter('truncate', function () {
    
	return function (text, length, end) {
		
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