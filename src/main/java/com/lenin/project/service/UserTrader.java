package com.lenin.project.service;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;

public class UserTrader {
	
	private static Double transactionFee = 0.002;
	
	protected User user;
	protected TransactionRepository transactionRepository;
	protected UserRepository userRepository;
	
	public UserTrader(User user, UserRepository userRepository, TransactionRepository transactionRepository) {
		
		this.user = user;
		this.transactionRepository = transactionRepository;
		this.userRepository = userRepository;
		
	}
	
	
	public RequestResponse trade(Transaction transaction) {
		
		RequestResponse response = new RequestResponse();
		
		transaction.setUser(user);
		
		Double feeFactor = 1-UserTrader.transactionFee;
		
		if(user.getLive()) {
			
			JSONObject tradeResult = BtceApi.trade(transaction, feeFactor);
			
			try {
				
				Integer success = tradeResult.getInt("success");
				response.setSuccess(success);
				
				if(success == 1) {
					
					executeTransaction(transaction);
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				response.setSuccess(0);
				response.setMessage(e.getMessage());
				
			}
			
		} else {
			
			executeTransaction(transaction);
			
			response.setSuccess(1);
			
		}
		
		return response;
		
	}
	
	
	private void executeTransaction(Transaction transaction) {
		
		System.out.println("exec tx");
		
		Double totalFeeFactor = (1-UserTrader.transactionFee)*(1-BtceApi.transactionFee);
		
		if(transaction.getType().equals("buy")) {
			
			Double usdVal = transaction.getAmount() * transaction.getRate();
			
			user.setUsd(user.getUsd() - usdVal);
			user.setLtc(user.getLtc() + (transaction.getAmount()*totalFeeFactor));
			
		} else if(transaction.getType().equals("sell")) {
			
			Double usdVal = (transaction.getAmount()*totalFeeFactor) * transaction.getRate();
			
			user.setUsd(user.getUsd() + usdVal);
			user.setLtc(user.getLtc() - transaction.getAmount());
			
		}
		
		Transaction reverseTransaction = transaction.getReverseTransaction();
		
		if(reverseTransaction != null) {
			
			Double transactionRevenue = 0.0;
			Double transactionAmount = transaction.getAmount()*totalFeeFactor;
			Double reverseTransactionAmount = reverseTransaction.getAmount()*totalFeeFactor;
			
			if(transaction.getType().equals("sell")) {
				
				transactionRevenue = 
					(transactionAmount*transaction.getRate()) - 
					(reverseTransactionAmount*reverseTransaction.getRate());
			
			} else if(transaction.getType().equals("buy")) {
				
				transactionRevenue = 
						(reverseTransactionAmount*reverseTransaction.getRate()) -
						(transactionAmount*transaction.getRate());
			
			}
				
			user.setProfitUsd(user.getProfitUsd() + transactionRevenue);
			
			transactionRepository.delete(reverseTransaction);
			
		}
		
		userRepository.save(user);
		
		if(transaction.getSave()) {
			transactionRepository.save(transaction);
		}
		
		
	}
	
	
	protected Double actualTradeRate(String type) {
		
		if(type == "buy") {
			return BtceApi.currentBuyRateLtcUsd - user.getRateBuffer();
		} else if(type == "sell") {
			return BtceApi.currentSellRateLtcUsd + user.getRateBuffer();
		} else {
			return null;
		}
		
	}


	protected RequestResponse reverseTrade(Transaction transaction, Boolean save) {
		
		System.out.println("reverse trading...");
		
		Transaction reverseTransaction = createReverseTransaction(transaction);
		reverseTransaction.setSave(save);
		
		RequestResponse tradeResult = trade(reverseTransaction);
		
		return tradeResult;
		
	};
	
	
	protected Transaction createReverseTransaction(Transaction transaction) {
		
		String reverseType = null;
		
		if(transaction.getType().equals("sell")) {
			reverseType = "buy";
		} else if(transaction.getType().equals("buy")) {
			reverseType = "sell";
		}
		
		System.out.println("REVERSED TYPE TO "+reverseType);
		
		Transaction reverseTransaction = 
			BtceApi.createTransaction("ltc_usd", transaction.getAmount(), actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.setReverseTransaction(transaction);
		
		return reverseTransaction;
		
	}
	
	
}
