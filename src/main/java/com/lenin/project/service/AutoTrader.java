package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;

public class AutoTrader extends BtceTrader {
	
	private TransactionRepository transactionRepository;
	private UserRepository userRepository;
	
	public AutoTrader(User user, TransactionRepository transactionRepository, UserRepository userRepository) {
		
		super(user);
		
		this.transactionRepository = transactionRepository;
		this.userRepository = userRepository;
		
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
			
			Double highestSell = highestSell();
			if(highestSell == null) {
				highestSell = BtceApi.oldRateLtcUsd;
			}
			
			Double lowestBuy = lowestBuy();
			if(lowestBuy == null) {
				lowestBuy = BtceApi.oldRateLtcUsd;
			}
			
			//System.out.println(BtceApi.currentSellRateLtcUsd - highestSell);
			//System.out.println(BtceApi.currentBuyRateLtcUsd - lowestBuy);
			
			if(BtceApi.currentSellRateLtcUsd - highestSell >= user.getProfitTarget() && 
				user.getLtc() >= tradeChunk && BtceApi.currentSellRateLtcUsd > user.getSellFloor()) {
				
				Transaction sellTransaction = BtceApi.createTransaction(tradeChunk, actualTradeRate("sell"), "sell");
				sellTransaction.setSave(true);
				
				trade(sellTransaction);
				BtceApi.oldRateLtcUsd = BtceApi.currentRateLtcUsd;
				
			
			} else if(BtceApi.currentBuyRateLtcUsd - lowestBuy <= 
				-(user.getProfitTarget()*1) && BtceApi.currentBuyRateLtcUsd < user.getBuyCeiling() &&
				user.getUsd() >= (tradeChunk * actualTradeRate("buy"))) {
			
				Transaction buyTransaction = BtceApi.createTransaction(tradeChunk, actualTradeRate("buy"), "buy");
				buyTransaction.setSave(true);
				
				trade(buyTransaction);
				BtceApi.oldRateLtcUsd = BtceApi.currentRateLtcUsd;
				
			}
			
		}
		
	}
	
	
	public void trade(Transaction transaction) {
		
		transaction.setUser(user);
		
		if(user.getLive()) {
			
			JSONObject tradeResult = BtceApi.trade(transaction);
			
			try {
				
				Integer success = tradeResult.getInt("success");
				
				if(success == 1) {
					
					executeTransaction(transaction);
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				
			}
			
		} else {
			
			executeTransaction(transaction);
			
		}
		
	}
	
	
	private void executeTransaction(Transaction transaction) {
		
		System.out.println("exec tx");
		
		Double usdVal = transaction.getAmount() * transaction.getRate();
		
		if(transaction.getType().equals("buy")) {
			
			user.setUsd(user.getUsd() - usdVal);
			user.setLtc(user.getLtc() + transaction.getAmount());
			
		} else if(transaction.getType().equals("sell")) {
			
			user.setUsd(user.getUsd() + usdVal);
			user.setLtc(user.getLtc() - transaction.getAmount());
			
		}
		
		Transaction reverseTransaction = transaction.getReverseTransaction();
		
		if(reverseTransaction != null) {
			
			Double transactionRevenue = 0.0;
			
			if(transaction.getType().equals("sell")) {
				
				transactionRevenue = 
					(transaction.getAmount()*transaction.getRate()) - 
					(reverseTransaction.getAmount()*reverseTransaction.getRate());
			
			} else if(transaction.getType().equals("buy")) {
				
				transactionRevenue = 
						(reverseTransaction.getAmount()*reverseTransaction.getRate()) -
						(transaction.getAmount()*transaction.getRate());
			
			}
				
			user.setProfitUsd(user.getProfitUsd() + transactionRevenue);
			
			transactionRepository.delete(reverseTransaction);
			
		}
		
		if(transaction.getSave()) {
			transactionRepository.save(transaction);
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
   		
		List<Transaction> transactions = transactionRepository.findByUserAndType(user, "buy");
		
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
