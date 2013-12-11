controllers.controller('ChartsCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	console.log("INIT CHART!!");
	
	$scope.firstLoad = true;
	$scope.loadingData = false;
	$scope.chartStatus = "";
	
	$scope.chartScaleOptions = 
		[
		 	{ period: "6h", precision: "15s" },
		 	{ period: "24h", precision: "1min" },
		 	{ period: "1wk", precision: "10min" },
		 	{ period: "1m", precision: "30min" },
		 	{ period: "6m", precision: "4h" },
		 	{ period: "12m", precision: "6h" }
		 	
		];
	
	
	if($scope.user.live) {
		$scope.chartScale = "30min";
	} else {
		$scope.chartScale = "15s";
	}
	
	$scope.chartFrom = 0;
	$scope.chartUntil = Math.round((new Date()).getTime()/1000);
	$scope.chart;
	$scope.graph;
	$scope.maGraph1;
	$scope.maGraph2;
	$scope.graphType = "candlestick";
	$scope.maxCandlesticks = 200;
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
		//$scope.chart.validateNow();
		//$scope.setupChart();
		$scope.parseData();
		
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
	    
		console.log("parsing data, live = "+$scope.user.currentTradingSession.live);
		
		$scope.loadingData = true;
		$scope.chartStatus = "Loading chart data...";
		
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
			
			$scope.chartStatus = "Getting chart history from server...";
			
			API.getRates($scope.user.currentTradingSession.service, $scope.user.currentTradingSession.pair, $scope.chartScale, from, until, function(response) {
				
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
					
					//console.log(rate.movingAverages);
					
					if(rate.movingAverages[$scope.ma1type] != undefined) {
						$scope.chartData.push({
							date: date,
							ma1: rate.movingAverages[$scope.ma1type]
						});
					}
					
					if(rate.movingAverages[$scope.ma2type] != undefined) {
						$scope.chartData.push({
							date: date,
							ma2: rate.movingAverages[$scope.ma2type]
						});
					}
		        	
		        
				}
				
				$scope.chartStatus = "Plotting charts...";
				
				console.log("update live chart data");
				$scope.setupChart();
				
				$scope.chartStatus = "Loaded.";
				
				$scope.loadingData = false;
				$scope.firstLoad = false;
				
				
			});
			
			
		} else {
			
			$scope.chartStatus = "Getting chart data from local storage...";
			
			if(localStorage.rates != undefined) {
				
				var rates = angular.fromJson(localStorage.rates);
				//console.log("load charts from storage:");
				var ratesData = rates[$scope.user.currentTradingSession.pair][$scope.chartScale];
				//console.log(ratesData);
				$scope.chartData = ratesData;
				
				var lastRate = $scope.user.currentTradingSession.rate;
				
				var lastLong = lastRate.movingAverages["testLong"];
				var lastShort = lastRate.movingAverages["testShort"];
				lastRate.movingAverages["testLong"] = lastRate.buy;
				lastRate.movingAverages["testShort"] = lastRate.sell;
				
				//if(lastLong == undefined) {
					lastLong = lastRate.buy;
				//}
				
				//if(lastShort == undefined) {
					lastShort = lastRate.sell;
				//}
				
				API.setRate(lastRate, function(response) {
					
				});
					
				var dateLongPrev = new Date((lastRate.time*1000)-15000);
				var dateLong = new Date(lastRate.time*1000);
				
				$scope.chartData.push({
					date: dateLongPrev,
					ma1: lastLong
				});
				
				$scope.chartData.push({
					date: dateLongPrev,
					ma2: lastLong
				});
				
				$scope.chartData.push({
					date: dateLong,
					ma1: lastLong
				});
				
				$scope.chartData.push({
					date: dateLong,
					ma2: lastLong
				});
			
			}
			
			$scope.chartStatus = "Plotting charts...";
			
			$scope.setupChart();
			
			$scope.chartStatus = "Loaded.";
			
			$scope.loadingData = false;
			
			
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
	
	/*
	AmCharts.ready(function() {
		console.log("CHARTS READY!");
		$scope.setupChart();
	});
	*/
	
	$scope.setupChart = function() {
	    
		
	    // SERIAL CHART
	    var chart = new AmCharts.AmSerialChart();
	    
	    chart.pathToImages = "js/libs/images/";
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
	    graph.type = "candlestick";
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
	    
	    console.log(!$scope.user.live+", "+$scope.user.currentTradingSession.autoTradingOptions.autoTradingModel);
	    
	    var scrollGraph = undefined;
	    
	    if($scope.user.live || (!$scope.user.live && $scope.user.currentTradingSession.autoTradingOptions.autoTradingModel == "simpleDelta")) {
	    	console.log("Add rates graph");
	    	chart.addGraph(graph);
	    	scrollGraph = graph;
	    }
	    
	    var maGraph1 = new AmCharts.AmGraph();
	    maGraph1.title = "SMA 1";
	    maGraph1.valueField = "ma1";
	    maGraph1.lineThickness = 2;
	    maGraph1.lineColor = "#5fb503";
	    maGraph1.balloonText = "[[title]]: [[value]]";
	    
	    var maGraph2 = new AmCharts.AmGraph();
	    maGraph2.title = "SMA 2";
	    maGraph2.valueField = "ma2";
	    maGraph2.lineThickness = 2;
	    maGraph2.lineColor = "#ff9933";
	    maGraph2.balloonText = "[[title]]: [[value]]";
	    
		
	    
	    // CURSOR                
	    var chartCursor = new AmCharts.ChartCursor();
	    //chart.addChartCursor(chartCursor);
	    
	    // SCROLLBAR
	    var chartScrollbar = new AmCharts.ChartScrollbar();
	    chartScrollbar.scrollbarHeight = 30;
	    
	    if(scrollGraph != undefined) {
	    	chartScrollbar.graph = graph; // as we want graph to be displayed in the scrollbar, we set graph here
	    } else {
	    	chartScrollbar.graph = maGraph1; // as we want graph to be displayed in the scrollbar, we set graph here
	    }
	    
	    chartScrollbar.graphType = "line"; // we don't want candlesticks to be displayed in the scrollbar                
	    chartScrollbar.gridCount = 5;
	    chartScrollbar.color = "#FFFFFF";
	    chart.addChartScrollbar(chartScrollbar);
	    
	    $scope.chart = chart;
	    $scope.graph = graph;
	    $scope.maGraph1 = maGraph1;
	    $scope.maGraph2 = maGraph2;
	    
	    
	    if(($scope.user.live && $scope.ma1visible) || (!$scope.user.live && $scope.user.currentTradingSession.autoTradingOptions.autoTradingModel == "movingAvg")) {
	    	console.log("Add ma1 graph");
	    	$scope.chart.addGraph($scope.maGraph1);
	    }
	    
	    if(($scope.user.live && $scope.ma2visible) || (!$scope.user.live && $scope.user.currentTradingSession.autoTradingOptions.autoTradingModel == "movingAvg")) {
	    	console.log("Add ma2 graph");
	    	$scope.chart.addGraph($scope.maGraph2);
	    }
	    
	    // WRITE
	    $scope.chart.write("chartdiv");
	
	    //});
	
	}
	    
	// create chart
	//AmCharts.ready(function() {
		
	//$scope.parseData();
		//$scope.setupChart();
		//console.log("CHART READY!");
		
	//
	//});
	
	// first parse data string      
    //$scope.parseData();
    //$scope.setupChart();
    
	$scope.updateTestChart = function(scale, time) {
		
		var rate = $scope.user.currentTradingSession.rate;
		
		//console.log(rate);
		
		if(rate.setType != undefined && $scope.user.currentTradingSession.service == "test") {
			return false;
		}
		
		var testRate = $scope.testRates[scale];
		//console.log(testRate);
		
		if(testRate == null) {
			return false;
		}
		
		var lastRate = testRate["lastRate"];
		
		$scope.testRates[scale]["movingAverages"] = rate.movingAverages;
		$scope.testRates[scale]["ma1"] = rate.movingAverages["testLong"];
		$scope.testRates[scale]["ma2"] = rate.movingAverages["testShort"];
		
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
		var date = new Date(rate.time*1000);
		
		$scope.testRates[scale]["lastRate"] = rate;
		
		var chartRate = {
			time: rate.time,
            date: date,
            open: $scope.testRates[scale]["open"],
            close: rate.last,
            high: $scope.testRates[scale]["high"],
            low: $scope.testRates[scale]["low"],
            movingAverages: $scope.testRates[scale]["movingAverages"]
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
			
			console.log("savingRate: ");
			console.log(chartRate);
			
			rates[$scope.user.currentTradingSession.pair][scale].push(chartRate);
			localStorage.rates = angular.toJson(rates);
			
		}
		
		console.log(rate);
		console.log(scale+"/"+$scope.chartScale+"/"+rate.movingAverages[$scope.ma1type]+"/"+rate.movingAverages[$scope.ma2type]);
		
		if(scale == $scope.chartScale) {
			
			console.log(rate);
			
			var ma1type = $scope.ma1type;
			var ma2type = $scope.ma2type;
			
			if($scope.user.live == false) {
				ma1type = "testLong";
				ma2type = "testShort";
			}
			
			$scope.chartData.push(chartRate);
			
			if(rate.movingAverages[ma1type] != undefined) {
				$scope.chartData.push({
					date: date,
					ma1: rate.movingAverages[ma1type]
				});
			}
			
			if(rate.movingAverages[ma2type] != undefined) {
				$scope.chartData.push({
					date: date,
					ma2: rate.movingAverages[ma2type]
				});
			}
			
			//$scope.chart.validateNow();
			console.log("updae test chart data");
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
		
		if($scope.chart != null && value != undefined) {
			console.log("update chart: "+value.last);
			$scope.updateChart();
		}
		
	}, true);
	
	
	$scope.$watch('sessionLoaded', function(value) {
		
		console.log("chart tradestats changed > "+value);
		
		console.log("init chart");
		
		if(value == true) {
			$scope.parseData();
		}
		
	}, true);
	
	$scope.$watch('ma1type', function(value) {
		
		console.log("ma1type changed to "+value+"("+$scope.firstLoad+")");
		
		if($scope.firstLoad == false && value != undefined) {
			$scope.parseData();
		}
		
	}, true);
	
	$scope.$watch('ma2type', function(value) {
		
		console.log("ma1type changed to "+value+"("+$scope.firstLoad+")");
		
		if($scope.firstLoad == false && value != undefined) {
			$scope.parseData();
		}
		
	}, true);
	
	$scope.$watch('ma1visible', function(value) {
		
		console.log("TOGGLE GRAPH 1: "+value);
		
		if($scope.chart != undefined) {
		
			if(value == true) {
				$scope.chart.addGraph($scope.maGraph1);
			} else {
				$scope.chart.removeGraph($scope.maGraph1);
			}
			
		}
		
	}, true);
	
	$scope.$watch('ma2visible', function(value) {
		
		console.log("TOGGLE GRAPH 2: "+value);
		
		if($scope.chart != undefined) {
			if(value == true) {
				$scope.chart.addGraph($scope.maGraph2);
			} else {
				$scope.chart.removeGraph($scope.maGraph2);
			}
		}
		
		
	}, true);
	
	
}]);
