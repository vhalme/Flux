var API = {
		
		loopInterval: 0,
		
		userId: "testUser456",
		authToken: null,
		tradingSessionId: null,
		
		send: function(method, url, data, dataType, contentType, callback) {
			
			var request = {
			    	
				async: false,
			    type: method,
			    url: url,
		  		headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradingSession-Id": this.tradingSessionId
			    },
			    	
			    success: callback
			    
			};
			
			if(data != undefined) {
				request.data = data;
			}
			
			if(dataType != undefined) {
				request.dataType = dataType;
			}
			
			if(contentType != undefined) {
				request.contentType = contentType;
			}
			
			$.ajax(request);
			
			
		},
		
		
		refreshReqTransactions: function(type, state, callback) {
			
			var url = "service/fundtransaction?type="+type+"&state="+state;
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		
		refreshTransactions: function(account, stateNot, callback) {
			
			var url = "service/fundtransaction?account="+account+"&stateNot="+stateNot;
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		
		transferFunds: function(type, fromAccount, amount, currency, callback) {
		    
			var url = "service/fundtransaction/transfer?type="+type+"&account="+fromAccount+
				"&amount="+amount+"&currency="+currency;
			
			this.send("POST", url, undefined, "json", "application/json", callback);
			
			
		},
		
		
		changeFunds: function(fund, change, callback) {
			
			var url = "service/user/funds?fund="+fund+"&change="+change;
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		getTradingSession: function(callback) {
		    
			var url = "service/tradingsession";
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		refreshTradingSession: function(callback) {
		    
			var url = "service/tradingsession";
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		addTradingSession: function(pair, callback) {
		    
			var url = "service/tradingsession";
			
			this.send("POST", url, pair, "text", "text/plain", callback);
			
			
		},
		
		deleteTradingSession: function(tradingSession, callback) {
			
			var url = "service/tradingsession";
			
			this.send("DELETE", url, angular.toJson(tradingSession), "json", "application/json", callback);
			
		},
		
		
		getTransactions: function(callback) {
			
			var url = "service/order";
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		
		cancelTransaction: function(transaction, callback) {
			
			var url = "service/order?cancel=true";
			
			this.send("POST", url, angular.toJson(transaction), "json", "application/json", callback);
			
		},
		
		
		postTransaction: function(transaction, callback) {
			
			var url = "service/order";
			
			this.send("POST", url, angular.toJson(transaction), "json", "application/json", callback);
			
		},
		
		deleteTransaction: function(transaction, callback) {
			
			var url = "service/order";
			
			this.send("DELETE", url, angular.toJson(transaction), "json", "application/json", callback);
			
			
		},
		
		saveCurrentTradingSession: function(tradingSession, callback) {
			
			var url = "service/tradingsession";
			
			this.send("PUT", url, angular.toJson(tradingSession), "json", "application/json", callback);
				
		},
		
		
		saveAutoTradingOptions: function(autoTradingOptions, callback) {
			
			var url = "service/tradingsession/autotradingoptions";
			
			this.send("PUT", url, angular.toJson(autoTradingOptions), "json", "application/json", callback);
			
		},
		
		
		setRate: function(rate, callback) {
			
			var url = "service/rate";
			
			this.send("PUT", url, angular.toJson(rate), "json", "application/json", callback);
			
		},
		
		
		getUser: function(callback) {
			
			var url = "service/user";
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		
		getRates: function(pair, setType, from, until, callback) {
			
			var url = "service/rate?pair="+pair+"&setType="+setType+"&from="+from+"&until="+until;
			console.log(url);
			
			this.send("GET", url, undefined, undefined, undefined, callback);
			
		},
		
		
		setFunds: function(left, right, callback) {
			
			var url = "service/user/funds?";
			
			if(left != null) {
				url += "left="+left;
			}
			
			if(right != null) {
				
				if(left != null) {
					url += "&";
				}
				
				url += "right="+right;
			}
			
			this.send("POST", url, undefined, "json", "application/json", callback);
			
			
		},
		
		
		login: function(email, password, callback) {
			
			var url = "service/login";
			
			this.userId = email;
			
			this.send("POST", url, undefined, "json", "application/json", callback);
			
		},
		
		
		addUserFunds: function(currency, amount, callback) {
			
			var url = "service/user/funds?currency="+currency+"&amount="+amount;
			
			this.send("POST", url, undefined, "json", "application/json", callback);
			
		},
		
		
		execCoinCommand: function(method, params, callback) {
			
			var params = 
				[
				 	currency,
				 	address,
				 	amount
			    ];
			
			var url = "service/btcrpc?method="+method;
			
			this.send("POST", url, angular.toJson(params), "json", "application/json", callback);
			
			
		}
		

}



 

