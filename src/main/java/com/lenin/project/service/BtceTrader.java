package com.lenin.project.service;

import org.codehaus.jettison.json.JSONObject;

import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;

public class BtceTrader {
	
	protected User user;
	
	public BtceTrader(User user) {
		this.user = user;
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


	protected void reverseTrade(Transaction transaction, Boolean save) {
		
		System.out.println("reverse trading...");
		
		Transaction reverseTransaction = createReverseTransaction(transaction);
		reverseTransaction.setSave(save);
		
		JSONObject tradeResult = BtceApi.trade(reverseTransaction);
		
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
			BtceApi.createTransaction(transaction.getAmount(), actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.setReverseTransaction(transaction);
		
		return reverseTransaction;
		
	}
	
	
}
