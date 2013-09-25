function ChartsCtrl($scope, $routeParams, $http) {
	
	console.log("INIT CHART!!");
	
	$scope.chartScaleOptions = 
		[
		 	{ period: "6h", precision: "15s" },
		 	{ period: "24h", precision: "1min" },
		 	{ period: "1wk", precision: "10min" },
		 	{ period: "1m", precision: "30min" },
		 	{ period: "6m", precision: "4h" },
		 	{ period: "12m", precision: "6h" }
		 	
		];
	
	$scope.chartScale = "1min";
	$scope.chartFrom = 0;
	$scope.chartUntil = Math.round((new Date()).getTime()/1000);
	$scope.chart;
	$scope.graph;
	$scope.graphType = "candlestick";
	$scope.maxCandlesticks = 100;
	$scope.chartData = [];
	
	$scope.testRates = {
	    "15s" : {
	    	"lastRate" : null,
	    	"open" : null,
	    	"low" : null,
	    	"high" : null
	    },
	    "1min" : {
	    	"lastRate" : null,
	    	"open" : null,
	    	"low" : null,
	    	"high" : null
	    },
	    "10min" : {
	    	"lastRate" : null,
	    	"open" : null,
	    	"low" : null,
	    	"high" : null
	    },
	    "30min" : {
	    	"lastRate" : null,
	    	"open" : null,
	    	"low" : null,
	    	"high" : null
	    }
	};
	
	
	$scope.setChartScale = function(precision) {
		$scope.chartScale = precision;
		console.log("new chart scale = "+$scope.chartScale);
		$scope.parseData();
		$scope.setupChart();
		
	};
	
	// this method is called when chart is first inited as we listen for "dataUpdated" event
	function zoomChart() {
		
	    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
		//$scope.chart.zoomToIndexes($scope.chartData.length - 32, $scope.chartData.length - 1);
		
		var lastRate = $scope.chartData[$scope.chartData.length - 1];
		
		var nowDate = new Date();
		var nowTime = nowDate.getTime();
		
		var timeSpan = 10*60*1000;
		
		if($scope.chartScale == "1min") {
			timeSpan = 40*60*1000;
		} else if($scope.chartScale == "10min") {
			timeSpan = 400*60*1000;
		} else if($scope.chartScale == "30min") {
			timeSpan = 1200*60*1000;
		} else if($scope.chartScale == "4h") {
			timeSpan = 9600*60*1000;
		} else if($scope.chartScale == "6h") {
			timeSpan = 14400*60*1000;
		}
		
		var startDate = new Date(nowTime-timeSpan);
		var endDate = new Date(nowTime+(10*60*1000));
		
		$scope.chart.zoomToDates(startDate, endDate);
	    
	}

	// changes graph type to line/candlestick, depending on the selected range
	function changeGraphType(event) {
	    
		var startIndex = event.startIndex;
	    var endIndex = event.endIndex;
	    
	    var chart = $scope.chart;
	    var graph = $scope.graph;
	    
	    if(endIndex - startIndex > $scope.maxCandlesticks) {
	        
	    	// change graph type
	        if(graph.type != "line") {
	        	graph.type = "line";
	        	graph.fillAlphas = 0;
	        	chart.validateNow();
	        }
	        
	    } else {
	    	
	        // change graph type
	        if(graph.type != $scope.graphType) {
	        	graph.type = $scope.graphType;
	        	graph.fillAlphas = 1;
	        	chart.validateNow();
	        }
	        
	    }
	    
	}

	// this methid is called each time the selected period of the chart is changed
	function handleZoom(event) {
		
	    var startDate = event.startDate;
	    var endDate = event.endDate;
	    
	    document.getElementById("startDate").value = AmCharts.formatDate(startDate, "DD/MM/YYYY");
	    document.getElementById("endDate").value = AmCharts.formatDate(endDate, "DD/MM/YYYY");

	    // as we also want to change graph type depending on the selected period, we call this method
	    changeGraphType(event);
	
	}

	// Parse data
	$scope.parseData = function() {
	    
		
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
		    
				$scope.chartData = [];
		    
				for(var i=0; i<rates.length; i++) {
			
					var rate = rates[i];
				
					var date = new Date(rate.time*1000);
					var high = rate.high;
					var low = rate.low;
					var open = rate.open;
					var close = rate.close;
		        
		        
					if(high == 0 || low == 0) {
						high = rate.buy;
						low = rate.sell;
					} else if($scope.chartScale == "15s") {
						high = rate.last;
						low = rate.last;
					}
		        
					if(open == 0 || close == 0) {
						open = rate.last;
						close = rate.last;
					}
					
					$scope.chartData.push({
			            date: date,
			            open: open,
			            high: high,
			            low: low,
			            close: close
			        });
		        
		        
				}
			
			});
			
			
		} else {
			
			if(localStorage.rates != undefined) {
				
				var rates = angular.fromJson(localStorage.rates);
				
				$scope.chartData = rates[$scope.user.currentTradingSession.pair][$scope.chartScale];
			
			}
			
		}
	    
	};


	// this method is called when user changes dates in the input field
	function changeZoomDates() {
		
	    var startDateString = document.getElementById("startDate").value;
	    var endDateString = document.getElementById("endDate").value;
	    var startDate = stringToDate(startDateString);
	    var endDate = stringToDate(endDateString);
	    
	    $scope.chart.zoomToDates(startDate, endDate);
	    
	}

	// create chart
	//AmCharts.ready(function() {
		
		//console.log("CHART READY!");
		
	    
	    
	$scope.setupChart = function() {
	    
		
	    // SERIAL CHART
	    var chart = new AmCharts.AmSerialChart();
	    
	    chart.pathToImages = "https://localhost/Flux/js/libs/images/";
	    chart.dataProvider = $scope.chartData;
	    chart.categoryField = "date";
	    chart.marginTop = 0;
	    chart.marginRight = 10;    
	    // listen for dataUpdated event ad call "zoom" method then it happens
	    chart.addListener('dataUpdated', zoomChart);
	    // listen for zoomed event andcall "handleZoom" method then it happens
	    chart.addListener('zoomed', handleZoom);

	    var period = "1mm";
	    
	    if($scope.chartScale == "15s") {
	    	period = "15ss";
	    } else if($scope.chartScale == "10min") {
	    	period = "10mm";
	    } else if($scope.chartScale == "30min") {
	    	period = "30mm";
	    } else if($scope.chartScale == "4h") {
	    	period = "4hh";
	    } else if($scope.chartScale == "6h") {
	    	period = "6hh";
	    }
	    
	    // AXES
	    // category
	    var categoryAxis = chart.categoryAxis;
	    categoryAxis.parseDates = true; // as our data is date-based, we set this to true
	    categoryAxis.minPeriod = period; // our data is daily, so we set minPeriod to "DD"
	    categoryAxis.dashLength = 1;
	    categoryAxis.tickLenght = 0;
	    categoryAxis.inside = true;

	    // value
	    var valueAxis = new AmCharts.ValueAxis();
	    valueAxis.dashLength = 1;
	    valueAxis.axisAlpha = 0;
	    chart.addValueAxis(valueAxis);

	    // GRAPH
	    var graph = new AmCharts.AmGraph();
	    graph.title = "Price:";
	    // as candlestick graph looks bad when there are a lot of candlesticks, we set initial type to "line"
	    graph.type = "line";
	    // graph colors
	    graph.lineColor = "#7f8da9";
	    graph.fillColors = "#7f8da9";
	    graph.negativeLineColor = "#db4c3c";
	    graph.negativeFillColors = "#db4c3c";
	    graph.fillAlphas = 1;
	    // candlestick graph has 4 fields - open, low, high, close
	    graph.openField = "open";
	    graph.highField = "high";
	    graph.lowField = "low";
	    graph.closeField = "close";
	    // this one is for "line" graph type
	    graph.valueField = "close";
	    graph.balloonText = 
	    		"O: [[open]] C: [[close]]" +
	    		"\nL: [[low]] H: [[high]]"

	    chart.addGraph(graph);

	    // CURSOR                
	    var chartCursor = new AmCharts.ChartCursor();
	    //chart.addChartCursor(chartCursor);

	    // SCROLLBAR
	    var chartScrollbar = new AmCharts.ChartScrollbar();
	    chartScrollbar.scrollbarHeight = 30;
	    chartScrollbar.graph = graph; // as we want graph to be displayed in the scrollbar, we set graph here
	    chartScrollbar.graphType = "line"; // we don't want candlesticks to be displayed in the scrollbar                
	    chartScrollbar.gridCount = 5;
	    chartScrollbar.color = "#FFFFFF";
	    chart.addChartScrollbar(chartScrollbar);
	    
	    $scope.chart = chart;
	    $scope.graph = graph;
	    
	    // WRITE
	    $scope.chart.write("chartdiv");
	
	    //});
	
	}
	
	
	// first parse data string      
    $scope.parseData();
    $scope.setupChart();
    
	$scope.updateTestChart = function(scale, time) {
		
		var rate = $scope.user.currentTradingSession.rate;
		
		if(rate.setType != undefined && $scope.user.currentTradingSession.service == "test") {
			return false;
		}
		
		var testRate = $scope.testRates[scale];
		
		if(testRate == null) {
			return false;
		}
		
		var lastRate = testRate["lastRate"];
		
		if($scope.testRates[scale]["open"] == null) {
			$scope.testRates[scale]["open"] = rate.last;
			$scope.testRates[scale]["low"] = rate.last;
			$scope.testRates[scale]["high"] = rate.last;
		}
		
		if(lastRate != null && rate.time - lastRate.time < time) {
			
			if(rate.last > $scope.testRates[scale]["high"]) {
				$scope.testRates[scale]["high"] = rate.last;
			}
			
			if(rate.sell < $scope.testRates[scale]["low"]) {
				$scope.testRates[scale]["low"] = rate.last;
			}
			
			return false;
		
		}
		
		return true;
		
	};
	
	
	$scope.addTestRate = function(scale) {
		
		var rate = $scope.user.currentTradingSession.rate;
		
		$scope.testRates[scale]["lastRate"] = rate;
		
		var chartRate = {
			time: rate.time,
            date: new Date(rate.time*1000),
            open: $scope.testRates[scale]["open"],
            close: rate.last,
            high: $scope.testRates[scale]["high"],
            low: $scope.testRates[scale]["low"],
        };
		
		$scope.testRates[scale]["open"] = rate.last;
		
		$scope.testRates[scale]["high"] = rate.last;
		$scope.testRates[scale]["low"] = rate.last;
		
		if($scope.user.currentTradingSession.live == false) {
			
			if(localStorage.rates == undefined) {
				
				var rates = {
						"ltc_usd" : {
							"15s" : [],
							"1min" : [],
							"10min" : [],
							"30min" : []
						},
						"btc_usd": {
							"15s" : [],
							"1min" : [],
							"10min" : [],
							"30min" : []
						},
						"ltc_btc": {
							"15s" : [],
							"1min" : [],
							"10min" : [],
							"30min" : []
						}
				};
				
				localStorage.rates = JSON.stringify(rates);
				
			}
			
			var rates = angular.fromJson(localStorage.rates);
			
			if(rates[$scope.user.currentTradingSession.pair][scale].length > 600) { 
				rates[$scope.user.currentTradingSession.pair][scale].shift();
			}
			
			rates[$scope.user.currentTradingSession.pair][scale].push(chartRate);
			localStorage.rates = angular.toJson(rates);
			
		}
		
		if(scale == $scope.chartScale) {
			$scope.chartData.push(chartRate);
			$scope.setupChart();
		}
		
		return chartRate;
		
	};
	
	$scope.updateChart = function() {
		
		//console.log($scope.user.currentTradingSession.rate);
		
		var rate = $scope.user.currentTradingSession.rate;
		var scale = $scope.chartScale;
		
		var rateAdded = {
			"15s" : $scope.updateTestChart("15s", 15),
			"1min" : $scope.updateTestChart("1min", 60),
			"10min" : $scope.updateTestChart("10min", 600),
			"30min" : $scope.updateTestChart("30min", 1800)		
		};
		
		if(rateAdded["15s"]) {
			$scope.addTestRate("15s");
		}
		
		if(rateAdded["1min"]) {
			$scope.addTestRate("1min");
		}
		
		if(rateAdded["10min"]) {
			$scope.addTestRate("10min");
		}
		
		if(rateAdded["30min"]) {
			$scope.addTestRate("30min");
		}
		
		//$scope.chart.write("chartdiv");
		
	};
	
	
	$scope.$watch('user.currentTradingSession.rate', function(value) {
		
		if($scope.chart != null) {
			console.log("update chart: "+value.last);
			$scope.updateChart();
		}
		
	}, true);
	
	
	$scope.$watch('currentTradingSessionId', function(value) {
		
		console.log("chart tradestats changed");
		
		console.log("init chart");
		$scope.parseData();
		$scope.setupChart();
		
	}, true);
	
	
};
