function TradeStatsCtrl($scope, $routeParams, $http) {
	
	if($routeParams.tradeStatsId != 0) {
		$scope.currentTradeStatsId = $routeParams.tradeStatsId;
		API.tradeStatsId = $scope.currentTradeStatsId;
	}
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	
	console.log("tradeStatsId="+$scope.currenTradeStatsId);
	
	$scope.transactions = [];
	
	$scope.chart = null;
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Accumulate USD", value: "accumulateUsd" }
	    ];
	
	$scope.rateChange = 0;
	
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	$scope.manualRateBuffer = 0.001;
	$scope.manualBuyCurrencyRight = 0;
	$scope.manualBuyCurrencyLeft = 0;
	$scope.manualSellCurrencyRight = 0;
	$scope.manualSellCurrencyLeft = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	$scope.newFundsLeft = undefined;
	$scope.newFundsRight = undefined;
	
	$scope.newCurrencyPair = "ltc_usd";
	
	
	$scope.start = function() {
		
		console.log("starting...");
		
		$scope.refreshInterval = 15;
		$scope.refreshCounter = $scope.refreshInterval;
		
		//$scope.refresh();
		
		$scope.intervalIds.main = setInterval( function() { 
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
	
	
	$scope.loop = function() {
		
		$scope.refresh();
		
	};
	
	$scope.refresh = function() {
		
		$scope.refreshCounter = $scope.refreshInterval;
		
		$scope.chart = null;
		
		API.refreshTradeStats(function(response) {
			
			if(response.success == 1) {
				
				$scope.user.currentTradeStats.fundsLeft = response.data.fundsLeft;
				$scope.user.currentTradeStats.fundsRight = response.data.fundsRight;
				$scope.user.currentTradeStats.profitLeft = response.data.profitLeft;
				$scope.user.currentTradeStats.profitRight = response.data.profitRight;
				$scope.user.currentTradeStats.rate = response.data.rate;
				
				$scope.setTransactions(response.data.transactions);
				
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.update = function() {
		
		$scope.rateChange = $scope.user.currentTradeStats.currentRate - $scope.user.currentTradeStats.oldRate;
		
	};
	
	$scope.addTab = function() {
		
		console.log($scope.newCurrencyPair);
		
		API.addTradeStats($scope.newCurrencyPair, function(newTradeStats) {
			console.log(angular.fromJson(newTradeStats));
			$scope.user.tradeStats.push(angular.fromJson(newTradeStats));
		});
		
	};
	
	
	$scope.setTransactions = function(transactions) {
		
		var updatedTransactions = [];
		updatedTransactions["buy"] = [];
		updatedTransactions["sell"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			updatedTransactions[transactions[i].type].push(transactions[i]);
		}
		
		$scope.transactions = updatedTransactions;
		
	};
	

	$scope.manualTransaction = function(type) {
		
		var amount;
		var rate;
		
		if(type == "buy") {
			rate = $scope.manualBuyRate;
			amount = $scope.manualBuyCurrencyRight;
		} else if(type == "sell") {
			rate = $scope.manualSellRate;
			amount = $scope.manualSellCurrencyRight;
		}
		
		if(rate == undefined || amount == undefined) {
			return;
		}
		
		var transaction = $scope.createTransaction($scope.user.currentTradeStats.pair, amount, rate, type);
		transaction.save = $scope.trackManualTransactions;
		
		$scope.performTransaction(transaction, function() {
			
		});
		
	};
	
	
	$scope.createTransaction = function(pair, amount, rate, type) {
		
		var transaction = { 
				
				time: (new Date()).getTime(),
				pair: pair,
				rate: rate, 
				amount: amount,
				type: type
		
		};
		
		return transaction;
		
	};
	
	
	$scope.performTransaction = function(transaction, performed) {
		
		API.postTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
				
				performed();
			
			}
		
		});
			
			
	};
	
	
	$scope.setFundsLeft = function() {
		API.setFunds($scope.newFundsLeft, null, function(response) {
			if(response.success == 1) {
				$scope.user.funds = response.data;
				$scope.user.currentTradeStats.fundsLeft = $scope.newFundsLeft;
			}
		});
	};
	
	$scope.setFundsRight = function() {
		API.setFunds(null, $scope.newFundsRight, function(response) {
			if(response.success == 1) {
				$scope.user.funds = response.data;
				$scope.user.currentTradeStats.fundsRight = $scope.newFundsRight;
			}
		});
	};
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentTradeStats.rate.buy - parseFloat($scope.user.currentTradeStats.autoTradingOptions.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentTradeStats.rate.sell + parseFloat($scope.user.currentTradeStats.autoTradingOptions.rateBuffer);
		}
		
	};
	
	
	$scope.currencyRightCashout = function() {
		return $scope.user.currentTradeStats.fundsRight + ($scope.user.currentTradeStats.fundsLeft / $scope.user.currentTradeStats.rate.buy);
	};
	
	$scope.currencyLeftCashout = function() {
		return $scope.user.currentTradeStats.fundsLeft + ($scope.user.currentTradeStats.fundsRight * $scope.user.currentTradeStats.rate.sell);
	};
	
	
	/* Variable properties */
	
	$scope.showAutoTrading = true;
	$scope.showManualTrading = true;
	$scope.showGraphs = true;
	
	
	/* Watchers */
	
	$scope.firstPassConvert = true;
	$scope.firstPassDetails = true;
	
	$scope.$watch('manualBuyCurrencyRight', function(value) {
		
		//console.log(value);
		
	    if(value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var fundsLeft = $scope.truncate(parseFloat(value)*$scope.manualBuyRate, 6);
	    		$scope.manualBuyCurrencyLeft = fundsLeft;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('manualBuyCurrencyLeft', function(value) {
		
		if(value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var fundsRight = $scope.truncate(parseFloat(value)/$scope.manualBuyRate, 6);
				$scope.manualBuyCurrencyRight = fundsRight;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('manualSellCurrencyRight', function(value) {
		
	    if (value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var fundsLeft = $scope.truncate(parseFloat(value)*$scope.manualSellRate, 6);
	    		$scope.manualSellCurrencyLeft = fundsLeft;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('manualSellCurrencyLeft', function(value) {
		
		if (value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var fundsRight = $scope.truncate(parseFloat(value)/$scope.manualSellRate, 6);
				$scope.manualSellCurrencyRight = fundsRight;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	
	$scope.$watch('user.currentTradeStats.rate.buy', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentTradeStats.rate.buy, 6);
	    }
		
	}, true);
	
	$scope.$watch('user.currentTradeStats.rate.sell', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentTradeStats.rate.sell, 6);
	    }
		
	}, true);
	
	
	$scope.$watch('user.currentTradeStats.autoTradingOptions', function(value) {
		
		if(value != null) {
			
			console.log("autotrading options changed");
			
			var buyThreshold = $scope.user.currentTradeStats.autoTradingOptions.buyThreshold;
			var sellThreshold = $scope.user.currentTradeStats.autoTradingOptions.sellThreshold;
			var tradeChunk = $scope.user.currentTradeStats.autoTradingOptions.tradeChunk;
			var buyCeiling = $scope.user.currentTradeStats.autoTradingOptions.buyCeiling;
			var sellFloor = $scope.user.currentTradeStats.autoTradingOptions.sellFloor;
			
			console.log($scope.user.currentTradeStats.autoTradingOptions);
			
			if(buyThreshold == undefined || sellThreshold == undefined || tradeChunk == undefined || buyCeiling == undefined | sellFloor == undefined) {
				return;
			}
			
			API.saveAutoTradingOptions(value, function(response) {
				if(response.success == 1) {
					$scope.user.currentTradeStats.autoTradingOptions = response.data;
				}
			});
			
			
		}
		
	}, true);
	
	
	$scope.$watch('currentTradeStatsId', function(value) {
		
		console.log("currentTradeStatsId set: "+value);
		
		API.getTradeStats(function(response) {
			
			if(response.success == 1) {
				console.log(response.data);
				$scope.user.currentTradeStats = response.data;
				$scope.refresh();
			} else {
				console.log(response);		
			}
			
		});
		
	}, true);
	
	
	$scope.truncate = function(val, length) {
		
		val = ""+val;
		
		if(val.length > length) {
			val = val.substring(0, length);
		}
		
		return parseFloat(val);
		
	};
		
	$scope.$on('$destroy', function() {
        console.log("destroying intervals: "+$scope.intervalIds);
        clearInterval($scope.intervalIds.main);
        clearInterval($scope.intervalIds.loop);
    });
	
	$scope.start();
	
	
};
