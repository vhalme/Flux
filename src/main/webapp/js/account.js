function AccountCtrl($scope, $routeParams, $http) {
	
	$scope.withdrawAddress = [];
	$scope.withdrawAmount = [];
	
	$scope.withdrawCoins = function(currency, address, amount) {
		
		console.log("withdraw "+currency+" "+amount+" to "+address);
		
		API.execCoinCommand("sendfrom", [ currency, address, amount ], function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				$scope.user.funds[currency] = response.data.funds[currency] - amount;
			}
			
		});
		
	};
	
	$scope.addUserFunds = function(currency, amount) {
		
		API.addUserFunds(currency, amount, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				$scope.user.funds[currency] = response.data.funds[currency];
			}
			
		});
		
	};
	
	
};