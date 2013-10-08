function LoginCtrl($scope, $routeParams, $location, $http) {
	
	$scope.username = "";
	
	$scope.password = undefined;
	$scope.passwordHidden = true;
	
	$scope.captchaValue = "";
	$scope.captchaAccepted = false;
	
	var url = $location.url();
	if(url.substring(1, 8) == "recover") {
		$scope.viewState = "reset";
	} else {
		$scope.viewState = "login";
	}
	
	$scope.status = undefined;
	
	$scope.passwordRecover = false;
	
	
	$scope.login = function(register, captcha) {
		
		$scope.status = "Connecting";
		
		console.log("try to log in user "+$scope.username+"( "+$scope.status+")");
		
		$scope.errors["login"] = undefined;
		
		
		API.login($scope.username, $scope.username, $scope.password, $scope.viewState == "register", captcha, function(response) {
			
			$scope.status = "Processing";
			
			response = angular.fromJson(response);
			
			console.log(response);
			console.log(typeof(response)+" success="+response.success+"("+typeof(response.success)+")");
			
			if(response.success > 0) {
				
				if(response.success == 2) {
					
					$scope.viewState = "register";
				
				} else if(response.success == 3 || response.success == 1) {
				
					console.log("call setUser");
					$scope.setUser(response.data);
			
				}
				
				$scope.status = "Processed successful response"
				
			} else {
				
				var error = {};
				
				if(response.success == -2) {
					
					$scope.reloadCaptcha();
					
					error = {
							message: "Incorrect captcha. Try again.",
							code: response.success,
					};
					
				} else {
					
					error = {
							message: "Log-In Failed. "+response.message,
							code: response.success,
					};
				
				}
				
				$scope.errors["login"] = error;
				
				$scope.status = "Processed error response";
				
			}
			
		});
		
	};
	
	
	$scope.reloadCaptcha = function() {
		
		var random = ""+Math.random();
		$("#captcha").attr("src", "jcaptcha.jpg?"+random);
		$scope.captchaValue = "";
		
	};
	
	
	$scope.resetPassword = function() {
		
		if($routeParams.recoveryToken == undefined) {
		
			if($scope.viewState != "recover") {
				
				$scope.viewState = "recover";
			
			} else {
				
				API.resetPassword("", $scope.username, function(response) {
					
					response = angular.fromJson(response);
					console.log(response);
					
					if(response.success == 1) {
					
						var info = {
								message: response.message,
								code: response.success,
						};
						
						$scope.infos["login"] = info;
						$scope.password = "";
						$scope.viewState = "login";
						$scope.go("/front");
						
					} else {
						
						var error = {
								message: response.message,
								code: response.success,
						};
						
						$scope.errors["login"] = error;
						$scope.password = "";
						$scope.viewState = "login";
						$scope.go("/front");
						
					}
				
					
				});
				
			
			}
			
		} else {
			
			API.resetPassword($scope.password, $routeParams.recoveryToken, function(response) {
				
				response = angular.fromJson(response);
				console.log(response);
				
				if(response.success == 1) {
				
					var info = {
							message: response.message,
							code: response.success,
					};
					
					$scope.infos["login"] = info;
					$scope.password = "";
					$scope.viewState = "login";
					$scope.go("/front");
					
				} else {
					
					var error = {
							message: response.message,
							code: response.success,
					};
					
					$scope.errors["login"] = error;
					$scope.password = "";
					$scope.viewState = "login";
					$scope.go("/front");
					
				}
			
				
			});
			
		}
		
	};
	
	
};