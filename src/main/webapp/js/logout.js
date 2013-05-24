function LogoutCtrl($scope, $routeParams, $http) {
	
	$scope.logout = function() {
		
		console.log("logging out");
		
		$scope.user = null;
		API.userId = null;
		API.tradingSessionId = null;
		
		$scope.setCookie("fluxUser", "", -1);
		$scope.setCookie("fluxToken", "", -1);
		
		$scope.go("/front");
		
	};
	
	$scope.logout();
	
};