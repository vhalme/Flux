var app = {
		
			leverage: 40,
			profitTarget: 0.06,
			aggressivity: 0.33,
			
			usd: 0,
			ltc: 0,
	
			lastBuyPrice: 0,
			lastSellPrice: 0,
	
			currentBuyPrice: 0,
			currentSellPrice: 0,
			
			buyMargin: 0,
			sellMargin: 0,
			
			buyHistory: {},
			sellHistory: {},
			
    		css : [],
    		js  : [],
    		//jqpath : 'myCustomjQueryPath.js', <-- option to include your own path to jquery
    
    		ready: function() {
    			
    			if(localStorage.buyHistory != undefined) {
    				this.buyHistory = JSON.parse(localStorage.buyHistory);
    			}
    			
    			if(localStorage.sellHistory != undefined) {
    				this.sellHistory = JSON.parse(localStorage.sellHistory);
    			}
    			
    			this.updatePrices();
    			this.setCurrentPrices();
    	
    			this.lastSellPrice = this.currentSellPrice;
    			this.lastBuyPrice = this.currentBuyPrice;
    	
    			var context = this;
    			
				setInterval(function() { context.loop(context); }, 20000);
		
   			},
   	
   			loop: function(context) {
   				
   				//API.getInfo();
   				//context.setCurrentPrices();
		
   			},
   			
   			setCurrentPrices: function() {
   				
   				var context = this;
   				
   				$.ajax({  
   					
   					url : "service/rates",
   					dataType : "json",
   					
   					success : function(data)  { 
   						
   						context.currentBuyPrice = data.ticker.buy;
   						context.currentSellPrice = data.ticker.sell;
   						
   						if(context.lastSellPrice == 0) {
   							context.lastSellPrice = context.currentSellPrice;
   							context.lastBuyPrice = context.currentBuyPrice;
   						}
   						
   						context.update();
   						
   					}
   				
   				});
   				
   				
   		
   			},
   			
   			update: function() {
   				
   				$("#min_price").html(this.currentBuyPrice);
				$("#max_price").html(this.currentSellPrice);
					
   				var usdElem = $("#cur1");
				var ltcElem = $("#cur2");
			
				var usdStr = usdElem.text();
				var ltcStr = ltcElem.text();
					
				this.usd = parseFloat(usdStr);
				this.ltc = parseFloat(ltcStr);
				
				this.buyMargin = this.lastBuyPrice - this.currentBuyPrice;
				this.sellMargin = this.currentSellPrice - this.lastSellPrice;
				
				$("#buy_margin").html(this.buyMargin);
				$("#sell_margin").html(this.sellMargin);
				
				var buyAmount = this.calcBuyAmount();
				var sellAmount = this.calcSellAmount();
				
				if(buyAmount > 0) {
					this.buy(buyAmount);
				} else {
					if(this.buyMargin > this.profitTarget) {
						buyAmount = (this.usd * this.aggressivity) / (this.currentBuyPrice + 0.01);
						this.buy(buyAmount);
					}
				}
					
				if(sellAmount > 0) {
					this.sell(sellAmount);
				} else {
					if(this.sellMargin > this.profitTarget) {
						sellAmount = this.ltc * this.aggressivity;
						this.sell(sellAmount);
					}
				}
				
   				
   			},
   			
   			raisePrice: function() {
   				
   				this.currentSellPrice += Math.random()*0.02;
   				this.currentBuyPrice = this.currentSellPrice + (0.01 * Math.random());
   				
   				this.update();
   				
   			},
   			
   			lowerPrice: function() {
   				
   				this.currentSellPrice -= Math.random()*0.02;
   				this.currentBuyPrice = this.currentSellPrice + (0.01 * Math.random());
   				
   				this.update();
   				
   			},
   	
   			calcBuyAmount: function() {
   		
				var buyPriceElem = $("#b_price");
				
   				var calculatedBuyAmount = 0;
   				
   				for(var price in this.sellHistory) {
   					
   					var priceVal = parseFloat(price);
   					var amountVal = parseFloat(this.sellHistory[price]);
   					var usdAmount = amountVal * priceVal;
   					
   					if(this.currentBuyPrice <= (priceVal - this.profitTarget)) {
   						
   						var actualBuyPrice = this.currentBuyPrice + 0.01;
   						
   						var newBuyAmount = 
   							calculatedBuyAmount + (usdAmount / actualBuyPrice);
   						
   						if(this.usd > (newBuyAmount * actualBuyPrice)) {
   							calculatedBuyAmount = newBuyAmount;
   							delete this.sellHistory[price];
   							console.log("buyFor += "+(newBuyAmount * actualBuyPrice));
   						} else {
   							console.log("OUT OF COINS!");
   							break;
   						}
   							
   						
   					}
   					
   				}
   				
   				var buyAmount = 0;
   				
   				if(calculatedBuyAmount > 0) {
   					buyAmount = calculatedBuyAmount;
   				}
   				
   				buyPriceElem.val(this.currentBuyPrice + 0.01);
   				
   				return buyAmount;
   				
   			},
   			
   			calcSellAmount: function() {
   		   		
				var sellPriceElem = $("#s_price");
				
   				var calculatedSellAmount = 0;
   				
   				for(var price in this.buyHistory) {
   					
   					var priceVal = parseFloat(price);
   					var amountVal = parseFloat(this.buyHistory[price]);
   					
   					if(this.currentSellPrice >= (priceVal + this.profitTarget)) {
   						
   						console.log("YES!");
   						
   						var newSellAmount = calculatedSellAmount + amountVal;
   						
   						if(this.ltc > newSellAmount) {
   							calculatedSellAmount = newSellAmount;
   							delete this.buyHistory[price];
   							console.log("sellAmount += "+amountVal);
   						} else {
   							console.log("OUT OF USD!")
   							break;
   						}
   						
   					}
   					
   						
   				}
   				
   				var sellAmount = 0;
   				
   				if(calculatedSellAmount > 0) {
   					sellAmount = calculatedSellAmount;
   				}
   				
   				sellPriceElem.val(this.currentSellPrice - 0.01);
   				
   				return sellAmount;
   				
   			},
   			
   			updatePrices: function() {
   				
   				//API.getInfo();
   				 
   				var usdVal = $("#cur1_in").val();
   				var ltcVal = $("#cur2_in").val();
   				$("#cur1").html(usdVal);
   				$("#cur2").html(ltcVal);
   				
   			},
   			
   			buy: function(buyAmount) {
   				
   				$("#b_btc").val(buyAmount);
   				
   				this.buyHistory[this.currentBuyPrice] = buyAmount;
   				console.log("BUY HISTORY:");
   				console.log(this.buyHistory);
   				console.log("SELL HISTORY:");
   				console.log(this.sellHistory);
   				
   				this.lastBuyPrice = this.currentBuyPrice;
   				this.lastSellPrice = this.currentBuyPrice;
   				
   				var priceInUsd = buyAmount * (this.currentBuyPrice + 0.01);
   				
   				/*
   				var usdVal = parseFloat($("#cur1_in").val());
   				var newUsdVal = usdVal - priceInUsd;
   				$("#cur1_in").val(newUsdVal);
   				
   				var ltcVal = parseFloat($("#cur2_in").val());
   				var newLtcVal = ltcVal + buyAmount;
   				$("#cur2_in").val(newLtcVal);
   				*/
   				
   				var buyHistoryJson = JSON.stringify(this.buyHistory);
   				console.log("save buy history: "+buyHistoryJson);
   				localStorage.buyHistory = buyHistoryJson;
   				
   				this.updatePrices();
   				
   			},
   			
   			sell: function(sellAmount) {
   				
   				$("#s_btc").val(sellAmount);
   				
   				var valueInUsd = sellAmount * (this.currentSellPrice - 0.01);
   				
   				this.sellHistory[this.currentSellPrice] = sellAmount;
   				console.log("BUY HISTORY:");
   				console.log(this.buyHistory);
   				console.log("SELL HISTORY:");
   				console.log(this.sellHistory);
   				
   				this.lastBuyPrice = this.currentSellPrice;
   				this.lastSellPrice = this.currentSellPrice;
   				
   				var usdVal = parseFloat($("#cur1_in").val());
   				var newUsdVal = usdVal + valueInUsd;
   				$("#cur1_in").val(newUsdVal);
   				
   				var ltcVal = parseFloat($("#cur2_in").val());
   				var newLtcVal = ltcVal - sellAmount;
   				$("#cur2_in").val(newLtcVal);
   				
   				var sellHistoryJson = JSON.stringify(this.sellHistory);
   				console.log("save sell history: "+sellHistoryJson);
   				localStorage.sellHistory = sellHistoryJson;
   				
   				this.updatePrices();
   				
   			}
   			
   		};


$(document).ready(function() {
	
	app.ready();
	
});

