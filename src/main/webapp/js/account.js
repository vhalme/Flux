controllers.controller("AccountCtrl", ["$scope", "$routeParams", "$http", function($scope, $routeParams, $http) {

	$scope.btceTransferAmount;
	$scope.btceTransferCurrency = "ltc";
	
	$scope.btceAdd = true;
	$scope.mtgoxAdd = true;
	
	$scope.withdrawAddress = [];
	$scope.withdrawAmount = [];
	
	$scope.pendingTxBtc = [];
	$scope.pendingTxLtc = [];
	$scope.pendingTxUsd = [];
	$scope.pendingTxBtce = [];
	$scope.pendingTxMtgox = [];
	
	$scope.refreshIntervalId = 0;
	
	$scope.editBtceKey = false;
	$scope.editBtceSecret = false;
	$scope.editMtgoxKey = false;
	$scope.editMtgoxSecret = false;
	
	$scope.showCurrency = "btc";
	$scope.paymentProperties = {};
	
	$scope.paymentErrors = [];
	
	$scope.sharedProfit = {
		"btc" : 0.0,
		"ltc" : 0.0,
		"usd" : 0.0
	};
	
	$scope.removalRequested = false;
	
	$scope.start = function() {
	
		$scope.paymentProperties = $scope.user.accountFunds.serviceProperties["payment"];
		var periods = $scope.paymentProperties.properties["periods"];
		
		console.log(periods);
		
		if(periods[0]["method"] == undefined || periods[0]["method"] == "") {
			$scope.setNextMethod = "monthly";
			$scope.setNextCurrency = "btc";
		} else {
			$scope.setNextMethod = periods[0]["method"];
			$scope.setNextCurrency = periods[0]["currency"];
		}
		
		$scope.evaluatePaymentFunds();
		$scope.refreshTransactions();
		
		$scope.refreshIntervalId = setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshTransactions(); 
			});
		}, 15000);
		
		
	};
	
	
	$scope.refreshTransactions = function() {
		
		API.refreshTransactions($scope.user.accountFunds.accountName, "completed", function(response) {

			$scope.checkResponse(response);
			
			$scope.pendingTxBtc = [];
			$scope.pendingTxLtc = [];
			$scope.pendingTxUsd = [];
			$scope.pendingTxBtce = [];
			$scope.pendingTxMtgox = [];
			
			console.log(response);
			
			var result = response.data;
			
			var transactions = result.transactions;
			
			for(var i=0; i<transactions.length; i++) {
				
				var transaction = transactions[i];
				transaction.dateStr = $scope.getDateString(transaction.time);
				transaction.type = transaction.type.substring(0, 1).toUpperCase()+transaction.type.substring(1);
				
				if(transaction.currency == "btc" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxBtc.push(transaction);
				} else if(transaction.currency == "ltc" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxLtc.push(transaction);
				} else if(transaction.currency == "usd" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxUsd.push(transaction);
				} else if(transaction.state == "transferReqBtce" || transaction.state == "readyTransferBtce" || transaction.state == "transferBtce") {
					$scope.pendingTxBtce.push(transaction);
				} else if(transaction.state == "mtgoxReqIn" || transaction.state == "mtgoxReqOut") {
					$scope.pendingTxMtgox.push(transaction);
				}
				
			}
			
			
			$scope.user.accountFunds.reserves = result.reserves;
			$scope.user.accountFunds.activeFunds = result.activeFunds;
			$scope.serviceFees = result.serviceFees;
			$scope.paymentProperties = result.paymentProperties;
			
			$scope.evaluatePaymentFunds();
			
		});
		
	};
	
	$scope.evaluatePaymentFunds = function() {
		
		$scope.paymentProperties = $scope.user.accountFunds.serviceProperties["payment"];
		var periods = $scope.paymentProperties.properties["periods"];
		
		$scope.paymentMethod = periods[1]["method"];
		$scope.paymentCurrency = periods[1]["currency"];
		
		$scope.nextPaymentMethod = periods[0]["method"];
		$scope.nextPaymentCurrency = periods[0]["currency"];
		
		$scope.sharedProfit = periods[1]["sharedProfit"];
		
		var dateStart = new Date(periods[1]["start"]);
		$scope.dateStart = dateStart.getFullYear()+"/"+(dateStart.getMonth()+1)+"/"+dateStart.getDate();
		var dateEnd = new Date(periods[1]["end"]);
		$scope.dateEnd = dateEnd.getFullYear()+"/"+(dateEnd.getMonth()+1)+"/"+dateEnd.getDate();
		var nextDateStart = new Date(periods[0]["start"]);
		$scope.nextDateStart = nextDateStart.getFullYear()+"/"+(nextDateStart.getMonth()+1)+"/"+nextDateStart.getDate();
		var nextDateEnd = new Date(periods[0]["end"]);
		$scope.nextDateEnd = nextDateEnd.getFullYear()+"/"+(nextDateEnd.getMonth()+1)+"/"+nextDateEnd.getDate();
		
		var method = $scope.paymentMethod;
		var currency = $scope.paymentCurrency;
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
		
		$scope.missingReserves = requiredReserves - reserves;
		
	};
	
	
	$scope.transfer = function(type, amount, currency, toAddress) {
		
		console.log(type+"/"+amount+"/"+currency+" from "+$scope.user.accountName);
		
		var address = null;
		if(toAddress != undefined) {
			address = toAddress;
		}
		
		API.transferFunds(type, $scope.user.accountName, toAddress, amount, currency, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
			} else {
				alert("Failed to transfer funds. Error message: "+response.message);
			}
			
		});
		
		
	};
	
	$scope.gotoOkpayPayment = function() {
		
		var date = new Date();
		var invoice = date.getTime()+"_"+$scope.user.accountFunds.accountName;
		var url = "https://www.okpay.com/process.html?ok_receiver=OK990732954&ok_item_1_name=Add+USD&ok_currency=USD&ok_item_1_type=service&ok_invoice="+invoice;
		
		location.href = url;
		
	};
	
	
	$scope.getDateString = function(time) {
		
		var date = new Date(time*1000);
		
		var year = date.getUTCFullYear();
		var month = date.getUTCMonth()+1;
		var day = date.getUTCDate();
		
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();
		
		return (""+year).substring(2)+"/"+$scope.addZero(month)+"/"+$scope.addZero(day)+
			" "+$scope.addZero(hours)+":"+$scope.addZero(minutes);
		
	};
	
	$scope.addZero = function(number) {
		if((""+number).length == 1) {
			return "0"+number;
		} else {
			return ""+number;
		}
	}
	
	$scope.setServiceProperties = function(service, propertyMap) {
		
		API.setServiceProperties(service, propertyMap, function(response) {
			
			console.log(response);
			
			if(response.success > 0) {
				
				$scope.user.accountFunds.serviceProperties[service] = response.data;
				
				if(service == "btce") {
					$scope.editBtceKey = false;
					$scope.editBtceSecret = false;
				} else if(service == "mtgox") {
					$scope.editMtgoxKey = false;
					$scope.editMtgoxSecret = false;
				}
				
				$scope.evaluatePaymentFunds();
				
			} else {
				
				
				/*
				var errorText = 
					"Insufficient funds for current payment method. Please, deposit at least "+
					missingReserves+" "+toUpperCase(currency)+" or change the payment method.";
					
				if(response.success == -2) {
					$scope.paymentErrors.push({ text: errorText });
				}
				*/
				
			}
			
		});

	};
	
	$scope.setServiceProperty = function(service, key, value) {
		
		console.log("set "+key+"="+value+" for "+service);
		
		var propertyMap = {
			properties : {}
		};
		
		propertyMap.properties[key] = value;
		
		$scope.setServiceProperties(service, propertyMap);
		
	};
	
	$scope.setNextPaymentMethod = function() {
		
		$scope.paymentErrors = [];
		
		console.log("set next payment mehod: "+$scope.setNextMethod+"/"+$scope.setNextCurrency);
		
		var propertyMap = {
			properties : {}
		};
		
		var periods = $scope.paymentProperties.properties["periods"];
		console.log(periods);
		var method = periods[1]["method"];
		
		if(method == undefined || method.length == 0 || $scope.missingReserves > 0) {
			
			periods[1]["method"] = $scope.setNextMethod;
			periods[1]["currency"] = $scope.setNextCurrency;
			
			if(method == undefined || method.length == 0) {
				periods[0]["method"] = $scope.setNextMethod;
				periods[0]["currency"] = $scope.setNextCurrency;
			}
		
		} else {
			
			periods[0]["method"] = $scope.setNextMethod;
			periods[0]["currency"] = $scope.setNextCurrency;
			
		}
		
		propertyMap.properties["periods"] = periods;
		
		$scope.setServiceProperties("payment", propertyMap);
		
	};
	
	$scope.removeAccount = function() {
		
		if($scope.removalRequested) {
			
			API.removeAccount($scope.user.id, function(response) {
				
				console.log(response);
				
				if(response.success == 1) {
					$scope.removalRequested = false;
					$scope.go("/front");
				}
				
			});
			
		} else {
			
			$scope.removalRequested = true;
		
		}
		
	};
	
	$scope.$on('$destroy', function() {
        console.log("destroying interval "+$scope.refreshIntervalId);
        clearInterval($scope.refreshIntervalId);
    });
	
	
	if($scope.user != undefined) {
		$scope.start();
	}
	
	$scope.$watch('userLoaded', function(value) {
		
		if(value == true) {
			$scope.start();
		}
		
	});
	
	
	//Holder.run({images:".img", nocss:true});
	
	
}]);
