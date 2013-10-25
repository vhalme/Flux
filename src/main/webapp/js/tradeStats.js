function TradingSessionCtrl($scope, $routeParams, $http) {
	
	if($routeParams.tradingSessionId != 0) {
		$scope.currentTradingSessionId = $routeParams.tradingSessionId;
		API.tradingSessionId = $scope.currentTradingSessionId;
		$scope.sessionLoaded = false;
	}
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	
	console.log("tradingSessionId="+$scope.currentTradingSessionId);
	
	$scope.transactions = [];
	
	$scope.chart = null;
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Simple Delta", value: "simpleDelta" },
		 	{ name: "Moving Average", value: "movingAvg" }
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
	
	$scope.buySellProfit = 0;
	$scope.sellBuyProfit = 0;
	$scope.rangeLeft = 0;
	$scope.rangeRight = 0;
	
	$scope.sessionKeysSet = false;
	
	$scope.start = function() {
		
		console.log("starting...");
		
		$scope.refreshInterval = 15;
		$scope.refreshCounter = $scope.refreshInterval;
		
		if($scope.user != undefined) {
			$scope.refreshErrors();
		}
		
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
		
		API.refreshTradingSession(function(response) {
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				
				$("[rel=tooltip]").tooltip({ placement: 'bottom'});
				
				console.log(response);
				
				$scope.user.currentTradingSession = response.data.session;
				$scope.sessionLoaded = true;
				
				/*
				$scope.user.currentTradingSession.fundsLeft = response.data.fundsLeft;
				$scope.user.currentTradingSession.fundsRight = response.data.fundsRight;
				$scope.user.currentTradingSession.profitLeft = response.data.profitLeft;
				$scope.user.currentTradingSession.profitRight = response.data.profitRight;
				$scope.user.currentTradingSession.rate = response.data.rate;
				*/
				
				$scope.setTransactions(response.data.orders);
				
				$scope.user.accountFunds = response.data.accountFunds; //.activeFunds[$scope.user.currentTradingSession.service] = response.data.activeFunds;
				$scope.serviceFees = response.data.serviceFees;
				$scope.user.errors = response.data.userErrors;
				
				$scope.refreshErrors();
				
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.update = function() {
		
		$scope.rateChange = $scope.user.currentTradingSession.currentRate - $scope.user.currentTradingSession.oldRate;
		
	};
	
	$scope.refreshErrors = function() {
		
		var periods = $scope.user.accountFunds.serviceProperties["payment"].properties["periods"];
		
		var currency = periods[1]["currency"];
		var method = periods[1]["method"];
		
		$scope.errors["general"] = [];
		$scope.sessionKeysSet = true;
		$scope.paymentMethodSet = true;
		$scope.okToTrade = true;
		
		var service = $scope.user.currentTradingSession.service;
		
		var apiKey = $scope.user.accountFunds.serviceProperties[service].properties['apiKey'];
		var apiSecret = $scope.user.accountFunds.serviceProperties[service].properties['apiSecret'];
		
		if(apiKey == undefined || apiKey.length == 0 || apiSecret == undefined || apiSecret.length == 0) {
			
			if(service == "btce") {
				service = "BTC-e";
			}
			
			var error = {	
				code: 3001,
				service: service
			};
			
			$scope.errors["general"].push(error);
			
			$scope.sessionKeysSet = false;
			$scope.okToTrade = false;
			
		}
				
		if(method == undefined || method.length == 0) {
			
			var error = {	
				code: 2001
			};
			
			$scope.errors["general"].push(error);
			$scope.okToTrade = false;
			$scope.paymentMethodSet = false;
			
		} else {
			
			var reserves = $scope.user.accountFunds.reserves[currency];
			
			var requiredReserves = 0;
			
			if(method == "monthly") {
				if(currency == "btc") {
					requiredReserves = 0;
				} else if(currency == "ltc") {
					requiredReserves = 0;
				} else if(currency == "usd") {
					requiredReserves = 0;
				}
			} else if(method == "profit") {
				if(currency == "btc") {
					requiredReserves = 0;
				} else if(currency == "ltc") {
					requiredReserves = 0;
				} else if(currency == "usd") {
					requiredReserves = 0;
				}
			}
			
			var missing = requiredReserves - reserves;
			$scope.missingReserves = missing;
			
			if(missing > 0) {
				
				var error = {	
					code: 2002,
					currency: currency,
					missingFunds: missing
				}
				
				$scope.errors["general"].push(error);
				$scope.okToTrade = false;
			
			}
			
		}
		
		if($scope.user.errors != undefined && $scope.user.errors.length > 0) {
			$scope.okToTrade = false;
		}
		
	};
	
	$scope.addTab = function() {
		
		console.log($scope.newSession);
		
		API.addTradingSession($scope.newSession, function(response) {
			
			response = angular.fromJson(response);
			$scope.checkResponse(response);
			
			var newTradingSession = response.data;
			
			console.log(newTradingSession);
			$scope.user.tradingSessions.push(angular.fromJson(newTradingSession));
		
		});
		
	};
	
	
	$scope.setTransactions = function(transactions) {
		
		if(transactions == undefined) {
			return;
		}
		
		var updatedTransactions = [];
		updatedTransactions["buy"] = [];
		updatedTransactions["buy"]["manual"] = [];
		updatedTransactions["buy"]["auto"] = [];
		
		updatedTransactions["sell"] = [];
		updatedTransactions["sell"]["manual"] = [];
		updatedTransactions["sell"]["auto"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			updatedTransactions[transactions[i].type][transactions[i].mode].push(transactions[i]);
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
		
		var transaction = $scope.createTransaction($scope.user.currentTradingSession.pair, amount, rate, type);
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
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
				
				performed();
			
			} else {
				
				var error = {
						message: response.message,
						code: response.success
				};
				
				$scope.errors["orders"] = error;
				
			}
		
		});
			
			
	};
	
	$scope.setFundsLeft = function() {
		
		if($scope.user.currentTradingSession.fundsLeft == undefined) {
			return;
		}
		
		API.setFunds($scope.user.currentTradingSession.fundsLeft, null, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				$scope.user.accountFunds.activeFunds[$scope.user.currentTradingSession.service] = response.data;
			} else {
				var sFunds = response.data.split("_");
				$scope.user.currentTradingSession.fundsLeft = parseFloat(sFunds[0]);
				alert(response.message);
			}
		});
		
	};
	
	$scope.setFundsRight = function() {
		
		if($scope.user.currentTradingSession.fundsRight == undefined) {
			return;
		}
		
		API.setFunds(null, $scope.user.currentTradingSession.fundsRight, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				$scope.user.accountFunds.activeFunds[$scope.user.currentTradingSession.service] = response.data;
			} else {
				var sFunds = response.data.split("_");
				$scope.user.currentTradingSession.fundsRight = parseFloat(sFunds[1]);
				$scope.user.accountFunds.activeFunds[$scope.user.currentTradingSession.service] = response.data;
				alert(response.message);
			}
		});
		
	};
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentTradingSession.rate.buy - parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentTradingSession.rate.sell + parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		}
		
	};
	
	
	$scope.currencyRightCashout = function() {
		if($scope.user == undefined || $scope.user.currentTradingSession.fundsRight == undefined) {
			return 0;
		} else {
			return $scope.user.currentTradingSession.fundsRight + ($scope.user.currentTradingSession.fundsLeft / $scope.user.currentTradingSession.rate.buy);
		}
	};
	
	$scope.currencyLeftCashout = function() {
		if($scope.user == undefined || $scope.user.currentTradingSession.fundsLeft == undefined) {
			return 0;
		} else {
			return $scope.user.currentTradingSession.fundsLeft + ($scope.user.currentTradingSession.fundsRight * $scope.user.currentTradingSession.rate.sell);
		}
	};
	
	
	$scope.updateProjections = function() {
		
		var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
		var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
		var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
		var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
		var buyCeiling = $scope.user.currentTradingSession.autoTradingOptions.buyCeiling;
		var sellFloor = $scope.user.currentTradingSession.autoTradingOptions.sellFloor;
		
		console.log("updating projections");
		
		if(buyThreshold == undefined || sellThreshold == undefined || buyChunk == undefined || sellChunk == undefined || 
				buyCeiling == undefined | sellFloor == undefined) {
			console.log("insufficient data for projections");
			return;
		}
		
		var currentLastRate = $scope.user.currentTradingSession.rate.last;
		var currentBuyRate = $scope.user.currentTradingSession.rate.buy;
		var currentSellRate = $scope.user.currentTradingSession.rate.sell;
		var buyRate = currentBuyRate * (1-(buyThreshold/100));
		var sellRate = currentSellRate * (1+(sellThreshold/100));
		$scope.buySellProfit = (buyChunk*currentBuyRate)-(buyChunk*buyRate)-(0.002*2*buyChunk*currentBuyRate);
		$scope.sellBuyProfit = (sellChunk*sellRate)-(sellChunk*currentSellRate)-(0.002*2*sellChunk*currentSellRate);
		console.log("buySellP: "+$scope.buySellProfit+", sellBuyP: "+$scope.sellBuyProfit);
		if((""+$scope.buySellProfit).indexOf("e-") != -1) {
			$scope.buySellProfit = 0;
		}
		
		if((""+$scope.sellBuyProfit).indexOf("e-") != -1) {
			$scope.sellBuyProfit = 0;
		}
		
		var chunksRight = $scope.user.currentTradingSession.fundsRight/sellChunk;
		$scope.rangeRight = Math.pow(1+(sellThreshold/100), chunksRight) * currentSellRate;
		
		var rangeLeft = currentBuyRate;
		var fundsLeft = $scope.user.currentTradingSession.fundsLeft;
		
		var decr = 1-(buyThreshold/100);
		
		var minRate = currentBuyRate/100;
		
		while(fundsLeft > 0 && rangeLeft > minRate) {
			fundsLeft = fundsLeft - (buyChunk*rangeLeft);
			rangeLeft = rangeLeft*decr;
		}
		
		$scope.rangeLeft = rangeLeft;
		
		console.log("projections updated");
		
	};
	
	$scope.resetProfit = function(profitSide) {
	
		API.resetProfit(profitSide, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				if(profitSide == "left") {
					$scope.user.currentTradingSession.profitLeft = 0;
					$scope.user.currentTradingSession.profitLeftSince = new Date();
				} else {
					$scope.user.currentTradingSession.profitRight = 0;
					$scope.user.currentTradingSession.profitRightSince = new Date();
				}
			}
			
		});
		
	};
	
	/* Variable properties */
	
	$scope.showSessionFunds = true;
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
	
	
	$scope.$watch('user.currentTradingSession.rate.buy', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentTradingSession.rate.buy, 6);
	    	$scope.updateProjections();
	    }
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.rate.sell', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentTradingSession.rate.sell, 6);
	    	$scope.updateProjections();
	    }
		
	}, true);
	
	
	$scope.$watch('user.currentTradingSession.autoTradingOptions', function(value) {
		
		console.log("sessionLoaded="+$scope.sessionLoaded);
		
		if(value != null && $scope.sessionLoaded) {
			
			console.log("autotrading options changed");
			
			var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
			var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
			var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
			var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
			var buyCeiling = $scope.user.currentTradingSession.autoTradingOptions.buyCeiling;
			var sellFloor = $scope.user.currentTradingSession.autoTradingOptions.sellFloor;
			
			if(buyThreshold == undefined || sellThreshold == undefined || buyChunk == undefined || sellChunk == undefined || 
					buyCeiling == undefined | sellFloor == undefined) {
				return;
			}
			
			$scope.updateProjections();
			
			API.saveAutoTradingOptions(value, function(response) {
				
				console.log(response);
				
				$scope.checkResponse(response);
				
				if(response.success == 1) {
					$scope.user.currentTradingSession.autoTradingOptions = response.data;
				}
			
			});
			
			
		}
		
	}, true);
	
	
	$scope.$watch('currentTradingSessionId', function(value) {
		
		console.log("currentTradingSessionId set: "+value);
		
		$scope.sessionLoaded = false;
		$scope.refresh();
		
		/*
		API.getTradingSession(function(response) {
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				console.log(response.data);
				$scope.user.currentTradingSession = response.data;
				$scope.refresh();
			} else {
				console.log(response);
			}
			
			
		});
		*/
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.fundsLeft', function(value) {
		
		if(value != undefined && $scope.sessionLoaded) {
			console.log("fundsLeft set: "+value);
			$scope.setFundsLeft();
			$scope.updateProjections();
		}
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.fundsRight', function(value) {
		
		if(value != undefined && $scope.sessionLoaded) {
			console.log("fundsRight set: "+value);
			$scope.setFundsRight();
			$scope.updateProjections();
		}
		
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
