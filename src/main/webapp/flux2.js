function PhoneListCtrl($scope) {
	
	$scope.phone = 
	
	{	
			"name": "Nexus S",
	        "snippet": "Fast just got faster with Nexus S."
	};
	
	
}

var app = {
		
			leverage: 40,
			profitTarget: 0.1,
			aggressivity: 0.5,
			
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
    			
    			this.refresh();
    			
    			var context = this;
    			
				setInterval(function() { context.loop(context); }, 20000);
		
   			},
   	
   			loop: function(context) {
   				
   				context.refresh();
		
   			},
   			
   			refresh: function() {
   				
   				API.getInfo(function(info) {
   					this.ltc = info.return.funds.ltc;
   					this.usd = info.return.funds.usd;
   					$("#cur1").html(this.usd);
   					$("#cur2").html(this.ltc);
   				});
   				
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
   						
   						if(this.lastSellPrice == 0) {
   							this.lastSellPrice = this.currentSellPrice;
   							this.lastBuyPrice = this.currentBuyPrice;
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
					if(this.buyMargin > this.profitTarget && this.usd > 3) {
						buyAmount = (this.usd * this.aggressivity) / (this.currentBuyPrice + 0.01);
						this.buy(buyAmount);
					}
				}
					
				if(sellAmount > 0) {
					this.sell(sellAmount);
				} else {
					if(this.sellMargin > this.profitTarget && this.ltc > 1) {
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
   			
   			test1: function() {
   				
   				API.trade("ltc_usd", "buy", "0.1", "0.1", function(order) {
   					console.log(order);
   					console.log(order.success == 1);
   					
   				});
   				
   			},
   			
   			test2: function() {
   				
   				
   				
   			},
   			
   			buy: function(buyAmount) {
   				
   				
   				$("#b_btc").val(buyAmount);
   				
   				var actualRate = this.currentBuyPrice + 0.01;
   				actualRate = ""+actualRate;
   				
   				buyAmount = ""+buyAmount;
   				if(buyAmount.length > 6) {
   					buyAmount = buyAmount.substring(0, 6);
   				}
   				
   				API.trade("ltc_usd", "buy", actualRate, buyAmount, function(order) {
   					
   					console.log(order);
   					
   					if(order.success == 1) {
   						
   						this.buyHistory[this.currentBuyPrice] = buyAmount;
   	   	   				console.log("BUY HISTORY:");
   	   	   				console.log(this.buyHistory);
   	   	   				console.log("SELL HISTORY:");
   	   	   				console.log(this.sellHistory);
   	   	   				
   	   	   				this.lastBuyPrice = this.currentBuyPrice;
   	   	   				this.lastSellPrice = this.currentBuyPrice;
   	   	   				
   						var buyHistoryJson = JSON.stringify(this.buyHistory);
   		   				console.log("save buy history: "+buyHistoryJson);
   		   				localStorage.buyHistory = buyHistoryJson;
   						
   						
   					} else {
   						
   						_nonce = Math.round((new Date()).getTime() / 10000);
   						
   					}
   					
   				});
   				
   				
   			},
   			
   			sell: function(sellAmount) {
   				
   				$("#s_btc").val(sellAmount);
   				
   				var actualRate = this.currentSellPrice - 0.01;
   				actualRate = ""+actualRate;
   				
   				var sellAmount = 1/3-0.2;
   				sellAmount = ""+sellAmount;
   				if(sellAmount.length > 6) {
   					sellAmount = sellAmt.substring(0, 6);
   				}
   				
   				API.trade("ltc_usd", "sell", actualRate, sellAmount, function(order) {
   					
   					console.log(order);
   					
   					if(order.success == 1) {
   						
   						
   						this.sellHistory[this.currentSellPrice] = sellAmount;
   		   				console.log("BUY HISTORY:");
   		   				console.log(this.buyHistory);
   		   				console.log("SELL HISTORY:");
   		   				console.log(this.sellHistory);
   		   				
   		   				this.lastBuyPrice = this.currentSellPrice;
   		   				this.lastSellPrice = this.currentSellPrice;
   		   				
   						var sellHistoryJson = JSON.stringify(this.sellHistory);
   		   				console.log("save sell history: "+sellHistoryJson);
   		   				localStorage.sellHistory = sellHistoryJson;
   						
   						
   					} else {
   						
   						_nonce = Math.round((new Date()).getTime() / 10000);
   						
   					}
   					
   				});
   				
   				
   			}
   			
   		};


$(document).ready(function() {
	
	app.ready();
	
});

