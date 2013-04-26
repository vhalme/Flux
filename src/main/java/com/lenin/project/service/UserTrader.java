package com.lenin.project.service;

import java.util.Date;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;

import com.lenin.project.domain.Trade;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.TradeRepository;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;

public class UserTrader {
	
	private static Double transactionFee = 0.002;
	
	protected User user;
	protected TransactionRepository transactionRepository;
	protected UserRepository userRepository;
	
	@Autowired
	private TradeRepository tradeRepository;
	
	
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
			
			if(tradeResult == null) {
				response.setSuccess(0);
				response.setMessage("Could not get trade result.");
				return response;
			}
			
			try {
				
				Integer success = tradeResult.getInt("success");
				response.setSuccess(success);
				
				if(success == 1) {
					
					JSONObject resultData = tradeResult.getJSONObject("return");
					String orderId = resultData.getString("order_id");
					Double received = resultData.getDouble("received");
					Double remains = resultData.getDouble("remains");
					
					transaction.setOrderId(orderId);
					transaction.setReceived(received);
					transaction.setRemains(remains);
					
					System.out.println("Trade request posted successfully.");
					executeTransaction(transaction);
					
				} else {
					
					System.out.println("Trade request failed: "+success);
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				response.setSuccess(0);
				response.setMessage(e.getMessage());
				
			}
			
		} else {
			
			transaction.setOrderId(""+(new Date()).getTime());
			transaction.setReceived(transaction.getAmount()*Math.random());
			transaction.setRemains(transaction.getAmount()-transaction.getReceived());
			
			Trade trade = new Trade();
			trade.setAmount(transaction.getReceived());
			trade.setTime(Long.parseLong(transaction.getOrderId()));
			tradeRepository.save(trade);
			
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
			return user.getCurrentBuyRate()- user.getRateBuffer();
		} else if(type == "sell") {
			return user.getCurrentSellRate() + user.getRateBuffer();
		} else {
			return null;
		}
		
	}


	protected RequestResponse reverseTrade(Transaction transaction, Boolean save) {
		
		System.out.println("Reverting transaction.");
		
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
		
		//System.out.println("REVERSED TYPE TO "+reverseType);
		
		Transaction reverseTransaction = 
			BtceApi.createTransaction("ltc_usd", transaction.getAmount(), actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.setReverseTransaction(transaction);
		
		return reverseTransaction;
		
	}
	
	
}
