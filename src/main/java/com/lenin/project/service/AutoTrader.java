package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;

public class AutoTrader extends UserTrader {
	
	public AutoTrader(User user, UserRepository userRepository, TransactionRepository transactionRepository) {
		
		super(user, userRepository, transactionRepository);
		
	}
	
	
	public void autoTrade() {
		
		//System.out.println("Autotrading for "+user.getUsername());
		
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
			
			Double highestSell = highestSell();
			if(highestSell == null) {
				highestSell = user.getOldRate();
			}
			
			Double lowestBuy = lowestBuy();
			if(lowestBuy == null) {
				lowestBuy = user.getOldRate();
			}
			
			//System.out.println(BtceApi.currentSellRateLtcUsd+" - "+highestSell);
			//System.out.println(BtceApi.currentBuyRateLtcUsd+" - "+lowestBuy);
			
			if(user.getCurrentSellRate() - highestSell >= user.getProfitTarget() && 
				user.getLtc() >= tradeChunk && user.getCurrentSellRate() > user.getSellFloor()) {
				
				Transaction sellTransaction = BtceApi.createTransaction("ltc_usd", tradeChunk, actualTradeRate("sell"), "sell");
				sellTransaction.setSave(true);
				
				trade(sellTransaction);
				user.setOldRate(user.getCurrentRate());
				userRepository.save(user);
				
			
			} else if(user.getCurrentBuyRate() - lowestBuy <= 
				-(user.getProfitTarget()*1) && user.getCurrentBuyRate() < user.getBuyCeiling() &&
				user.getUsd() >= (tradeChunk * actualTradeRate("buy"))) {
			
				Transaction buyTransaction = BtceApi.createTransaction("ltc_usd", tradeChunk, actualTradeRate("buy"), "buy");
				buyTransaction.setSave(true);
				
				trade(buyTransaction);
				user.setOldRate(user.getCurrentRate());
				userRepository.save(user);
				
			}
			
		}
		
	}
	
	
	


	
	public Double lowestBuy() {
		
		List<Transaction> transactions = transactionRepository.findByUserAndType(user, "sell");
		
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
		
		List<Transaction> transactions = transactionRepository.findByUserAndType(user, "buy");
		
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
   		
		List<Transaction> transactions = transactionRepository.findByUserAndType(user, "sell");
		
		Double calculatedBuyAmount = 0.0;
		
		Double usedUsd = 0.0;
		
		List<Transaction> reversibleTransactions = new ArrayList<Transaction>();
		
		for(Transaction transaction : transactions) {
			
			Double rateVal = transaction.getRate();
			Double amountVal = transaction.getAmount();
			Double usdAmount = amountVal * rateVal;
			
			if(user.getCurrentBuyRate() <= (rateVal - user.getProfitTarget())) {
					
				Double actualBuyRate = actualTradeRate("buy");
				
				Double newBuyAmount = 
					calculatedBuyAmount + amountVal; // (usdAmount / actualBuyRate); //
					
				if(user.getUsd() > (newBuyAmount * actualBuyRate)) {
					calculatedBuyAmount = newBuyAmount;
					reversibleTransactions.add(transaction);
					System.out.println("buy "+amountVal+" for "+(amountVal * actualBuyRate));
				} else {
					//System.out.println("OUT OF USD!");
					break;
				}
				
			} else {
				
				usedUsd += usdAmount;
				
			}
				
		}
			
		return reversibleTransactions;
			
	};
		
	
	private List<Transaction> getReversibleBuys() {
   		
		List<Transaction> transactions = transactionRepository.findByUserAndType(user, "buy");
		
		Double calculatedSellAmount = 0.0;
		
		Double usedLtc = 0.0;
		
		List<Transaction> reversibleTransactions = new ArrayList<Transaction>();
		
		for(Transaction transaction : transactions) {
			
			Double rateVal = transaction.getRate();
			Double amountVal = transaction.getAmount();
			Double usdAmount = amountVal * rateVal;
			
			if(user.getCurrentSellRate() >= (rateVal + user.getProfitTarget())) {
				
				Double actualSellRate = actualTradeRate("sell");
				Double newSellAmount = calculatedSellAmount + amountVal;
				
				if(user.getLtc() > newSellAmount) {
					calculatedSellAmount = newSellAmount;
					reversibleTransactions.add(transaction);
					System.out.println("sell "+amountVal+" for "+(amountVal * actualSellRate));
				} else {
					//System.out.println("OUT OF LTC!");
					break;
				}
					
			} else {
				
				usedLtc += amountVal;
				
			}
				
			
		}
		
		return reversibleTransactions;
			
	}
	
	

}
