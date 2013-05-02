function TradeStatsCtrl($scope, $routeParams, $http) {
	
	$scope.tradeStatsId = $routeParams.tradeStatsId;
	API.tradeStatsId = $scope.tradeStatsId;
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 1;
	$scope.refreshCounter = 0;
	
	$scope.transactions = [];
	
	console.log("tradeStatsId="+$scope.tradeStatsId);
	
	$scope.chartScaleOptions = 
		[
		 	{ period: "6h", precision: "15s" },
		 	{ period: "24h", precision: "1min" },
		 	{ period: "1wk", precision: "10min" },
		 	{ period: "1m", precision: "30min" },
		 	{ period: "6m", precision: "4h" },
		 	{ period: "12m", precision: "6h" }
		 	
		];
	
	$scope.chart = null;
	$scope.chartScale = "15s";
	$scope.chartFrom = 0;
	$scope.chartUntil = Math.round((new Date()).getTime()/1000);
	$scope.chartData = [];
	
	$scope.setChartScale = function(precision) {
		$scope.chartScale = precision;
		console.log("new chart scale = "+$scope.chartScale);
		$scope.initChart();
	};
	
	$scope.user = {
		
		uninitialized: true,
		
		currentTradeStats: {
			
			rate: {
				buy: 0,
				sell: 0,
				last: 0
			},
			
			uninitialized: true,
			
			live: false,
			currencyLeft: "usd",
			currencyRight: "ltc",
		
		}
		
	};
	
	$scope.selectedUser = API.userId;
	
	$scope.availableUsers =
		[
		 
		 	"testUser123",
		 	"testUser456"
		 
		];
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Accumulate USD", value: "accumulateUsd" }
	    ];
	
	
	$scope.newCurrencyPair = "ltc_usd";
	
	$scope.rateChange = 0;
	
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	
	$scope.manualBuyCurrencyRight = 0;
	$scope.manualBuyCurrencyLeft = 0;
	$scope.manualSellCurrencyRight = 0;
	$scope.manualSellCurrencyLeft = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	$scope.start = function() {
		
		console.log("starting...");
		
		$scope.refreshInterval = 15;
		
		//$scope.setUser();
		
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
		
		$scope.refresh();
		
	};
	
	$scope.refresh = function() {
		
		$scope.refreshCounter = $scope.refreshInterval;
		
		API.getTradeStats(function(response) {
			
			if(response.success == 1) {
				
				$scope.user.currentTradeStats = response.data;
				
				//console.log($scope.user.currentTradeStats);
				
				if($scope.chart == null) {
					
					$scope.initChart();
					//$scope.chart.render();
					
				} else {
					
					//console.log($scope.user.currentTradeStats.rate);
					
					var dataPoint = {
							x: $scope.user.currentTradeStats.rate.time*1000,
							y: $scope.user.currentTradeStats.rate.last
					};
				
					$scope.chartData.push(dataPoint);
					$scope.chart.options.data[0].dataPoints = $scope.chartData;
				
					if($scope.user.currentTradeStats.live == false) {
						
						if(localStorage.rates == undefined) {
							
							var rates = {
									"ltc_usd" : [],
									"btc_usd": [],
									"ltc_btc": []
							};
							
							localStorage.rates = JSON.stringify(rates);
						}
						
						var rates = angular.fromJson(localStorage.rates);
						rates[$scope.user.currentTradeStats.pair].push(dataPoint);
						localStorage.rates = angular.toJson(rates);
						
					}
					
					$scope.chart.render();
				
				}
				
				//console.log($scope.chartData);
					
				API.getTransactions(function(transactions) {
						
					$scope.setTransactions(transactions);
					$scope.update();
						
				});
			
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.setTransactions = function(transactions) {
		
		$scope.transactions["buy"] = [];
		$scope.transactions["sell"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			$scope.transactions[transactions[i].type].push(transactions[i]);
		}
		
	}
	
	$scope.update = function() {
		
		$scope.rateChange = $scope.user.currentTradeStats.currentRate - $scope.user.currentTradeStats.oldRate;
		//console.log($scope.user.currentTradeStats.currentTradeStats.currentRate+" - "+$scope.user.currentTradeStats.currentTradeStats.oldRate+" = "+$scope.rateChange);
		$scope.updateChart();
		
	};
	
	$scope.initChart = function() {	
		
		$scope.chart = new CanvasJS.Chart("chartContainer", {
			
			zoomEnabled: true,
			
			title: {
				text: $scope.user.currentTradeStats.currencyLeft.toUpperCase()+" - "+
				$scope.user.currentTradeStats.currencyRight.toUpperCase()
			},
			
			toolTip: {
				shared: true,
				
			},
			
			legend: {
				verticalAlign: "top",
				horizontalAlign: "center",
                                fontSize: 14,
				fontWeight: "bold",
				fontFamily: "calibri",
				fontColor: "dimGrey"
			},
			
			axisX: {
				title: "",
			},
			
			axisY:{
				prefix: $scope.user.currentTradeStats.currencyLeft.toUpperCase()+" ",
				includeZero: false
			},
			
			data: [{ 
				// dataSeries1
				type: "line",
				xValueType: "dateTime",
				showInLegend: true,
				name: $scope.user.currentTradeStats.currencyLeft.toUpperCase()+" for 1 "+$scope.user.currentTradeStats.currencyRight.toUpperCase(),
				dataPoints: $scope.chartData
			}]
			
		});
		
		
		// dataPoints
		var dataPoints1 = [];
		
		if($scope.user.currentTradeStats.live == true) {
			
			var unixTime = Math.round((new Date()).getTime()/1000);
			var from = unixTime - (6 * 60 * 60);
			var until = unixTime;
			
			API.getRates($scope.user.currentTradeStats.pair, $scope.chartScale, from, until, function(response) {
			
				var rates = response.data;
			
				for(var i=0; i<rates.length; i++) {
				
					var rate = rates[i];
				
					var time = new Date(rate.time*1000);
					var yValue = rate.last;
				
					dataPoints1.push({
						x: time.getTime(),
						y: yValue
					});
			
				}
			
				console.log(dataPoints1);
				$scope.chartData = dataPoints1;
				$scope.chart.options.data[0].dataPoints = $scope.chartData;
				$scope.chart.render();
			
			});
			
			
		} else {
			
			if(localStorage.rates != undefined) {
				var rates = angular.fromJson(localStorage.rates);
				dataPoints1 = rates[$scope.user.currentTradeStats.pair];
				$scope.chartData = dataPoints1;
				$scope.chart.options.data[0].dataPoints = $scope.chartData;
			}
			
		}
		
		
	};
	
	
	$scope.updateChart = function() {
		
		
		
	};
	
	
	$scope.cancelTrade = function(transaction) {
		
		API.cancelTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
			
			}
		
		});
		
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
		
		var transaction = $scope.createTransaction($scope.user.currentTradeStats.pair, amount, rate, type);
		transaction.save = $scope.trackManualTransactions;
		
		$scope.performTransaction(transaction, function() {
			
		});
		
	};
	
	$scope.reverseTrade = function(transaction, save) {
		
		console.log("reverse trading...");
		
		var reverseTransaction = $scope.createReverseTransaction(transaction);
		reverseTransaction.save = save;
		
		$scope.performTransaction(reverseTransaction, function() {
			
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
		
		var reverseTransaction = 
			$scope.createTransaction($scope.user.currentTradeStats.pair, transaction.amount, $scope.actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.reversedTransaction = transaction;
		
		return reverseTransaction;
		
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
	
	
	$scope.removeTransaction = function(transaction) {
		
		API.deleteTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
			
			}
		
		});
		
	}
	
	$scope.addTab = function() {
		
		API.addTradeStats($scope.newCurrencyPair, function(newTradeStats) {
			console.log(angular.fromJson(newTradeStats));
			$scope.user.tradeStats.push(angular.fromJson(newTradeStats));
		});
		
	};
	
	$scope.changeProfitFormat = function(type) {
		if(type == "buy") {
			$scope.buyProfitFormat = $scope.otherProfitFormat(type);
		} else if(type == "sell") {
			$scope.sellProfitFormat = $scope.otherProfitFormat(type);
		}
	}
	
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentTradeStats.rate.buy - parseFloat($scope.user.currentTradeStats.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentTradeStats.rate.sell + parseFloat($scope.user.currentTradeStats.rateBuffer);
		}
		
	}
	
	$scope.buyProfit = function(buy) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		totalFeeFactor = totalFeeFactor*totalFeeFactor;
		
		if($scope.buyProfitFormat == "%") {
			return 100*(1-(buy.rate / ($scope.actualTradeRate("sell"))));
		} else if($scope.buyProfitFormat == "$") {
			return ((buy.amount*totalFeeFactor)*$scope.actualTradeRate("sell")) - ((buy.amount*totalFeeFactor)*buy.rate); 
		}
		
	};
	
	
	$scope.sellProfit = function(sell) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		totalFeeFactor = totalFeeFactor*totalFeeFactor;
		
		if($scope.sellProfitFormat == "%") {
			return 100*((sell.rate / ($scope.actualTradeRate("buy")))-1);
		} else if($scope.sellProfitFormat == "$") {
			return ((sell.amount*totalFeeFactor)*sell.rate) - ((sell.amount*totalFeeFactor)*$scope.actualTradeRate("buy")); 
		}
		
	};
	
	
	$scope.currencyRightCashout = function() {
		return $scope.user.currentTradeStats.fundsRight + ($scope.user.currentTradeStats.fundsLeft / $scope.actualTradeRate("buy"));
	};
	
	$scope.currencyLeftCashout = function() {
		return $scope.user.currentTradeStats.fundsLeft + ($scope.user.currentTradeStats.fundsRight * $scope.actualTradeRate("sell"));
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
	
	
	$scope.setUser = function() {
		
		API.getUser(function(users) {
			
			$scope.user = users[0];
			
			console.log($scope.user);
			
			var userTabs = $scope.user.tradeStats;
			
			if(API.tradeStatsId == null || API.tradeStatsId == 0) {
				API.tradeStatsId = userTabs[0].id;
				$scope.user.currentTradeStats = userTabs[0];
			}
			
			API.getTransactions(function(transactions) {
				
				$scope.setTransactions(transactions);
				
				$scope.chart = null;
				$scope.refresh();
				
			});
		
		});

		
	};
	
	$scope.changeToTestUser = function() {
		
		if(API.userId != "testUser123") {
			API.tradeStatsId = null;
		}
		
		console.log("user changed from "+API.userId+" to testuser456");
		
		API.userId = "testUser123";
		
		$scope.setUser();
		
		
	}
	
	$scope.changeToLiveUser = function() {
		
		if(API.userId != "testUser456") {
			API.tradeStatsId = null;
		}
		
		console.log("user changed from "+API.userId+" to testuser456");
		
		API.userId = "testUser456";
		
		$scope.setUser();
		
		
	}
	
	/* Test mode methods */
	
	$scope.raisePrice = function() {
		
		var random = true;
		
		if(random) {
			$scope.user.currentTradeStats.rate.sell += parseFloat(Math.random()*0.01);
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell + parseFloat(0.005 * Math.random());
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell + parseFloat(0.00025 * Math.random());
		} else {
			$scope.user.currentTradeStats.rate.sell += 0.1000;
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell;
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell;
		}
		
		
	};
	
	
	$scope.lowerPrice = function() {
		
		var random = true;
		
		if(random) {
			var priceChange = -parseFloat(Math.random()*0.01);
			if($scope.user.currentTradeStats.rate.sell + priceChange > 0.1) {
				$scope.user.currentTradeStats.rate.sell += priceChange;
				$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell + parseFloat(0.005 * Math.random());
				$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell + parseFloat(0.00025 * Math.random());
			}
		} else {
			$scope.user.currentTradeStats.rate.sell -= 0.1000;
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell;
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell;
		}
		
		
	};
	
	$scope.removeFundsLeft = function() {
		
		$scope.user.currentTradeStats.fundsLeft -= 10;
	
	};
	
	$scope.addFundsLeft = function() {
		
		$scope.user.currentTradeStats.fundsLeft += 10;
	
	};
	
	$scope.removeFundsRight = function() {
		
		$scope.user.currentTradeStats.fundsRight -= 10;
	
	};
	
	$scope.addFundsRight = function() {
		
		$scope.user.currentTradeStats.fundsRight += 10;
	
	};
	
	
	/* Variable properties */
	
	$scope.showAutoTrading = true;
	$scope.showManualTrading = true;
	$scope.showGraphs = true;
	
	$scope.buySort = $scope.buyProfit;
	$scope.buySortReverse = true;
	
	$scope.sellSort = $scope.sellProfit;
	$scope.sellSortReverse = true;
	
	$scope.buyProfitFormat = "%";
	$scope.sellProfitFormat = "%";
	
	
	
	/* Watchers */
	
	$scope.firstPassConvert = true;
	$scope.firstPassDetails = true;
	
	$scope.$watch('manualBuyCurrencyRight', function(value) {
		
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
	
	
	$scope.$watch('user.currentTradeStats.currentBuyRate', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentTradeStats.rate.buy, 6);
	    }
		
	}, true);
	
	$scope.$watch('user.currentTradeStats.currentSellRate', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentTradeStats.rate.sell, 6);
	    }
		
	}, true);
	
	
	$scope.$watch('user.currentTradeStats', function(value) {
		
		if(!value.uninitialized) {
			
			API.saveCurrentTradeStats(value, function(response) {
				$scope.user.currentTradeStats = response;
			});
			
		}
		
	}, true);
	
	
	$scope.$watch('selectedUser', function(value) {
		
		if(API.userId != value) {
			API.tradeStatsId = null;
		}
		
		console.log("user changed from "+API.userId+" to "+value);
		
		API.userId = value;
		
		$scope.setUser();
		
		
	}, true);
	
	$scope.truncate = function(val, length) {
		
		val = ""+val;
		
		if(val.length > length) {
			val = val.substring(0, length);
		}
		
		return parseFloat(val);
		
	};
	
	$scope.go = function (hash) {
		console.log("go to #"+hash);
		location.href = "#"+hash;
	};
		
	
	$scope.start();
	
	
};

var myApp = angular.module('myApp', ['filters']);

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

myApp.directive('customstyle', function () {
	
	return {
		
		restrict: 'AC',
		link: function (scope, element, attrs) {          
			
			console.log(attrs);
			console.log(attrs.myWidth);
			element.css('width', attrs.myWidth);
			
			scope.$watch(attrs.myWidth, function(value) {     
				console.log("myWidth: "+value);
				element.css('width', (value*100)+'%');            
			});
			
		}
		
   }
	
});

myApp.config(['$routeProvider', function($routeProvider) {
	
	$routeProvider.
    	when('/tradeStats/:tradeStatsId', { templateUrl: 'trading-view.html', controller: TradeStatsCtrl }).
    	otherwise( { redirectTo: '/tradeStats/0' } );
	}]

);
