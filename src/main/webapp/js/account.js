function AccountCtrl($scope, $routeParams, $http) {
	
	$scope.addUsd = undefined;
	$scope.addLtc = undefined;
	$scope.addBtc = undefined;
	
	$scope.addUserFunds = function(currency, amount) {
		
		API.addUserFunds(currency, amount, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				$scope.user.funds[currency] = response.data.funds[currency];
			}
			
		});
		
	};
	
	
};