function ChartsCtrl($scope, $routeParams, $http) {
	
	$scope.chartScaleOptions = 
		[
		 	{ period: "6h", precision: "15s" },
		 	{ period: "24h", precision: "1min" },
		 	{ period: "1wk", precision: "10min" },
		 	{ period: "1m", precision: "30min" },
		 	{ period: "6m", precision: "4h" },
		 	{ period: "12m", precision: "6h" }
		 	
		];
	
	$scope.chartScale = "15s";
	$scope.chartFrom = 0;
	$scope.chartUntil = Math.round((new Date()).getTime()/1000);
	$scope.chartData = [];
	
	$scope.setChartScale = function(precision) {
		$scope.chartScale = precision;
		console.log("new chart scale = "+$scope.chartScale);
		$scope.initChart();
	};
	
	
	$scope.createChart = function() {
		
		console.log("creating chart");
		
		$scope.chart = new CanvasJS.Chart("chartContainer", {
			
			zoomEnabled: true,
			
			title: {
				text: $scope.user.currentTradingSession.currencyLeft.toUpperCase()+" - "+
				$scope.user.currentTradingSession.currencyRight.toUpperCase()
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
				prefix: $scope.user.currentTradingSession.currencyLeft.toUpperCase()+" ",
				includeZero: false
			},
			
			data: [{ 
				// dataSeries1
				type: "line",
				xValueType: "dateTime",
				showInLegend: true,
				name: $scope.user.currentTradingSession.currencyLeft.toUpperCase()+" for 1 "+$scope.user.currentTradingSession.currencyRight.toUpperCase(),
				dataPoints: $scope.chartData
			}]
			
		});
		
	};
	
	$scope.initChart = function() {	
		
		// dataPoints
		var dataPoints1 = [];
		
		console.log("init charts for "+$scope.user.currentTradingSession.live+" stats / id: "+$scope.user.currentTradingSession.id);
		
		if($scope.user.currentTradingSession.live == true) {
			
			var unixTime = Math.round((new Date()).getTime()/1000);
			var from = unixTime - (6 * 60 * 60);
			
			if($scope.chartScale == "1min") {
				from = unixTime - (24 * 60 * 60);
			} else if($scope.chartScale == "10min") {
				from = unixTime - (7 * 24 * 60 * 60);
			} else if($scope.chartScale == "30min") {
				from = unixTime - (30 * 24 * 60 * 60);
			} else if($scope.chartScale == "4h") {
				from = unixTime - (182 * 24 * 60 * 60);
			} else if($scope.chartScale == "6h") {
				from = unixTime - (365 * 24 * 60 * 60);
			}
			
			var until = unixTime;
			
			API.getRates($scope.user.currentTradingSession.pair, $scope.chartScale, from, until, function(response) {
			
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
			
				//console.log(dataPoints1);
				$scope.chartData = dataPoints1;
				$scope.chart.options.data[0].dataPoints = $scope.chartData;
				$scope.chart.render();
			
			});
			
			
		} else {
			
			if(localStorage.rates != undefined) {
				var rates = angular.fromJson(localStorage.rates);
				dataPoints1 = rates[$scope.user.currentTradingSession.pair];
				$scope.chartData = dataPoints1;
				$scope.chart.options.data[0].dataPoints = $scope.chartData;
			}
			
			$scope.chart.render();
			
		}
		
		
	};
	
	
	$scope.updateChart = function() {
		
		//console.log($scope.user.currentTradingSession.rate);
		
		var dataPoint = {
				x: $scope.user.currentTradingSession.rate.time*1000,
				y: $scope.user.currentTradingSession.rate.last
		};
	
		$scope.chartData.push(dataPoint);
		$scope.chart.options.data[0].dataPoints = $scope.chartData;
	
		if($scope.user.currentTradingSession.live == false) {
			
			if(localStorage.rates == undefined) {
				
				var rates = {
						"ltc_usd" : [],
						"btc_usd": [],
						"ltc_btc": []
				};
				
				localStorage.rates = JSON.stringify(rates);
			}
			
			var rates = angular.fromJson(localStorage.rates);
			
			if(rates[$scope.user.currentTradingSession.pair].length > 600) { 
				rates[$scope.user.currentTradingSession.pair].shift();
			}
			
			rates[$scope.user.currentTradingSession.pair].push(dataPoint);
			localStorage.rates = angular.toJson(rates);
			
		}
		
		$scope.chart.render();
		
	};
	
	
	$scope.$watch('user.currentTradingSession.rate', function(value) {
		
		if($scope.chart != null) {
			//console.log("update chart: "+value.last);
			$scope.updateChart();
		}
		
	}, true);
	
	
	$scope.$watch('currentTradingSessionId', function(value) {
		
		console.log("chart tradestats changed");
		
		console.log("init chart");
		$scope.createChart();
		$scope.initChart();
		
	}, true);
	
	
};
