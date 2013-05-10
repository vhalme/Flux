function LogoutCtrl($scope, $routeParams, $http) {
	
	$scope.logout = function() {
		
		$scope.user = null;
		API.userId = null;
		API.tradeStatsId = null;
		
		$scope.setCookie("fluxUser", "", -1);
		
	};
	
	$scope.logout();
	
};