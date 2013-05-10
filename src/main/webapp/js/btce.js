var API = {
		
		loopInterval: 0,
		
		userId: "testUser456",
		authToken: null,
		tradeStatsId: null,
		
		changeFunds: function(fund, change, callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/funds?fund="+fund+"&change="+change,
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		},
		
		getTradeStats: function(callback) {
		    
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/tradeStats",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
			
		},
		
		refreshTradeStats: function(callback) {
		    
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/tradeStatsRefresh",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
			
		},
		
		addTradeStats: function(pair, callback) {
		    
			$.ajax({
		    	async: false,
		    	type: "POST",
		    	url: "service/tradeStats",
		    	dataType: "text",
	  			contentType: "text/plain",
		    	headers: {
					"User-Id": this.userId,
					"Token": this.authToken
		    	},
		    	data: pair,
		    	success: callback
		    });
			
			
		},
		
		deleteTradeStats: function(tradeStats, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "DELETE",
		    	url: "service/tradeStats",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(tradeStats),
		    	success: callback
		    
			});
			
		},
		
		getTransactions: function(callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/transaction",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		},
		
		
		cancelTransaction: function(transaction, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/transaction?cancel=true",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    	
		    });
			
		},
		
		
		postTransaction: function(transaction, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/transaction",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    	
		    });
			
		},
		
		deleteTransaction: function(transaction, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "DELETE",
		    	url: "service/transaction",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    
			});
			
		},
		
		saveCurrentTradeStats: function(tradeStats, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "PUT",
		    	url: "service/tradeStats",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(tradeStats),
		    	success: callback
		    
			});
			
		},
		
		
		saveAutoTradingOptions: function(autoTradingOptions, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "PUT",
		    	url: "service/autoTradingOptions",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(autoTradingOptions),
		    	success: callback
		    
			});
			
		},
		
		setRate: function(rate, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "PUT",
		    	url: "service/rate",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(rate),
		    	success: callback
		    
			});
			
		},
		
		getUser: function(callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/user",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		},
		
		
		getRates: function(pair, setType, from, until, callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/rates?pair="+pair+"&setType="+setType+"&from="+from+"&until="+until,
		    	success: callback
		    });
			
		},
		
		setFunds: function(left, right, callback) {
			
			var url = "service/funds?";
			
			if(left != null) {
				url += "left="+left;
			}
			
			if(right != null) {
				
				if(left != null) {
					url += "&";
				}
				
				url += "right="+right;
			}
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: url,
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    	
		    });
			
		},
		
		
		login: function(email, password, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/login",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": email,
					"Token": this.authToken,
					"Password": password
		    	},
		    	success: callback
		    	
		    });
			
		},
		
		addUserFunds: function(currency, amount, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/userfunds?currency="+currency+"&amount="+amount,
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"Token": this.authToken
		    	},
		    	success: callback
		    	
		    });
			
		}
		

}



 

