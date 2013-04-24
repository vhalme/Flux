package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;

public class AutoTrader extends BtceTrader {
	
	private List<Transaction> buyTransactions;
	private List<Transaction> sellTransactions;
	
	public AutoTrader(User user, List<Transaction> buys, List<Transaction> sells) {
		
		super(user);
		
		this.buyTransactions = buys;
		this.sellTransactions = sells;
	
	}
	
	public void trade() {
		
		List<Transaction> reversibleBuys = getReversibleBuys();
		List<Transaction> reversibleSells = getReversibleSells();
		
		for(Transaction reversibleBuy : reversibleBuys) {
			reverseTrade(reversibleBuy, false);
		}
		
		for(Transaction reversibleSell : reversibleSells) {
			reverseTrade(reversibleSell, false);
		}
		
		if(reversibleBuys.size() == 0 && reversibleSells.size() == 0) {
			
			Double tradeChunk = user.getTradeChunk();
			
			if(BtceApi.currentSellRateLtcUsd - highestSell() >= user.getProfitTarget() && 
				user.getLtc() >= tradeChunk && BtceApi.currentSellRateLtcUsd > user.getSellFloor()) {
				
				Transaction sellTransaction = BtceApi.createTransaction(tradeChunk, actualTradeRate("sell"), "sell");
				sellTransaction.setSave(true);
				
				//$scope.performTransaction(sellTransaction, function() {});
				//$scope.oldPrice = $scope.currentPrice;
			
			} else if(BtceApi.currentBuyRateLtcUsd - lowestBuy() <= 
				-(user.getProfitTarget()*1) && BtceApi.currentBuyRateLtcUsd < user.getBuyCeiling() &&
				user.getUsd() >= (tradeChunk * actualTradeRate("buy"))) {
			
				Transaction buyTransaction = BtceApi.createTransaction(tradeChunk, actualTradeRate("buy"), "buy");
				buyTransaction.setSave(true);
				
				//$scope.performTransaction(buyTransaction, function() {});
				//$scope.oldPrice = $scope.currentPrice;
				
			}
			
		}
		
	}
	
	
	public Double lowestBuy() {
		
		List<Transaction> transactions = sellTransactions;
		
		Double lowest = null;
		
		for(Transaction transaction : transactions) {
			if(lowest == null) {
				lowest = transaction.getRate();
			} else {
				if(transaction.getRate() < lowest) {
					lowest = transaction.getRate();
				}
			}
		}
		
		return lowest;
		
	}
	
	
	public Double highestSell() {
		
		List<Transaction> transactions = buyTransactions;
		
		Double highest = null;
		
		for(Transaction transaction : transactions) {
			if(highest == null) {
				highest = transaction.getRate();
			} else {
				if(transaction.getRate() < highest) {
					highest = transaction.getRate();
				}
			}
		}
		
		return highest;
		
	}
	
	
	private List<Transaction> getReversibleSells() {
   		
		List<Transaction> transactions = sellTransactions;
		
		Double calculatedBuyAmount = 0.0;
		
		Double usedUsd = 0.0;
		
		List<Transaction> reversibleTransactions = new ArrayList<Transaction>();
		
		for(Transaction transaction : transactions) {
			
			Double rateVal = transaction.getRate();
			Double amountVal = transaction.getAmount();
			Double usdAmount = amountVal * rateVal;
			
			if(BtceApi.currentBuyRateLtcUsd <= (rateVal - user.getProfitTarget())) {
					
				Double actualBuyRate = actualTradeRate("buy");
				
				Double newBuyAmount = 
					calculatedBuyAmount + amountVal; // (usdAmount / actualBuyRate); //
					
				if(user.getUsd() > (newBuyAmount * actualBuyRate)) {
					calculatedBuyAmount = newBuyAmount;
					reversibleTransactions.add(transaction);
					System.out.println("buy "+amountVal+" for "+(amountVal * actualBuyRate));
				} else {
					System.out.println("OUT OF USD!");
					break;
				}
				
			} else {
				
				usedUsd += usdAmount;
				
			}
				
		}
			
		return reversibleTransactions;
			
	};
		
	
	private List<Transaction> getReversibleBuys() {
   		
		List<Transaction> transactions = buyTransactions;
		
		Double calculatedSellAmount = 0.0;
		
		Double usedLtc = 0.0;
		
		List<Transaction> reversibleTransactions = new ArrayList<Transaction>();
		
		for(Transaction transaction : transactions) {
			
			Double rateVal = transaction.getRate();
			Double amountVal = transaction.getAmount();
			Double usdAmount = amountVal * rateVal;
			
			if(BtceApi.currentSellRateLtcUsd >= (rateVal + user.getProfitTarget())) {
				
				Double actualSellRate = actualTradeRate("sell");
				Double newSellAmount = calculatedSellAmount + amountVal;
				
				if(user.getLtc() > newSellAmount) {
					calculatedSellAmount = newSellAmount;
					reversibleTransactions.add(transaction);
					System.out.println("sell "+amountVal+" for "+(amountVal * actualSellRate));
				} else {
					System.out.println("OUT OF LTC!");
					break;
				}
					
			} else {
				
				usedLtc += amountVal;
				
			}
				
			
		}
		
		return reversibleTransactions;
			
	}
	
	

}
