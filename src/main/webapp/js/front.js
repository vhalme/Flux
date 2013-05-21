function FrontCtrl($scope, $routeParams, $http) {
	
	console.log("USER: "+$scope.user);
	
	if($scope.user != null) {
		$scope.go("/tradingSession/0");
	}
	
	
};