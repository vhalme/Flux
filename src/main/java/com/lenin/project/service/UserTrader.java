package com.lenin.project.service;

import java.util.Iterator;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.lenin.project.domain.Trade;
import com.lenin.project.domain.TradeStats;
import com.lenin.project.domain.Transaction;
import com.lenin.project.repositories.TradeRepository;
import com.lenin.project.repositories.TradeStatsRepository;
import com.lenin.project.repositories.TransactionRepository;

public class UserTrader {
	
	public static Double transactionFee = 0.002;
	
	protected TradeStats tradeStats;
	protected TransactionRepository transactionRepository;
	protected TradeStatsRepository tradeStatsRepository;
	private TradeRepository tradeRepository;
	
	
	public UserTrader(TradeStats tradeStats, TradeStatsRepository tradeStatsRepository, 
			TransactionRepository transactionRepository,
			TradeRepository tradeRepository) {
		
		this.tradeStats = tradeStats;
		this.transactionRepository = transactionRepository;
		this.tradeStatsRepository = tradeStatsRepository;
		this.tradeRepository = tradeRepository;
		
	}
	
	
	public RequestResponse cancelOrder(Transaction transaction) {
		
		RequestResponse response = new RequestResponse();
		
		if(tradeStats.getLive()) {
			
			JSONObject cancelOrderResult = BtceApi.cancelOrder(transaction);
		
			if(cancelOrderResult == null) {
				response.setSuccess(0);
				response.setMessage("Could not get order cancellation result.");
				return response;
			}
			
			try {
				
				Integer success = cancelOrderResult.getInt("success");
				response.setSuccess(success);
				
				if(success == 1) {
					
					if(transaction.getIsReversed()) {
						transactionRepository.delete(transaction);
					} else {
						transaction.setBrokerAmount(transaction.getFilledAmount());
						transaction.setAmount(transaction.getFilledAmount());
						transactionRepository.save(transaction);
					}
					
					System.out.println("Order cancelled successfully.");
					
				} else {
					
					System.out.println("Order cancellation request failed: "+success);
					Iterator<String> keys = cancelOrderResult.keys();
					
					while(keys.hasNext()) {
						String key = keys.next();
						System.out.println(key+" : "+cancelOrderResult.get(key));
					}
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				response.setSuccess(0);
				response.setMessage(e.getMessage());
				
			}
			
		} else {
			
			if(transaction.getIsReversed()) {
				transactionRepository.delete(transaction);
			} else {
				transaction.setBrokerAmount(transaction.getFilledAmount());
				transaction.setAmount(transaction.getFilledAmount());
				transactionRepository.save(transaction);
			}
			
			response.setSuccess(1);
			
		}
		
		return response;
		
	}
	
	public RequestResponse trade(Transaction transaction) {
		
		RequestResponse response = new RequestResponse();
		
		transaction.setTradeStats(tradeStats);
		transaction.setLive(tradeStats.getLive());
		
		Double feeFactor = 1-UserTrader.transactionFee;
		transaction.setBrokerAmount(transaction.getAmount()*(feeFactor-0.001));
		
		if(tradeStats.getLive()) {
			
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
					
					if(transaction.getRemains() == 0) {
						transaction.setFilledAmount(transaction.getBrokerAmount());
					}
					
					System.out.println("Trade request posted successfully.");
					executeTransaction(transaction);
					
				} else {
					
					BtceApi._nonce = System.currentTimeMillis() / 10000L;
					
					System.out.println("Trade request failed: "+success);
					Iterator<String> keys = tradeResult.keys();
					
					while(keys.hasNext()) {
						String key = keys.next();
						System.out.println(key+" : "+tradeResult.get(key));
					}
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				response.setSuccess(0);
				response.setMessage(e.getMessage());
				
			}
			
		} else {
			
			Long unixTime = System.currentTimeMillis() / 1000L;
			String orderId = ""+unixTime;
			
			transaction.setOrderId(orderId);
			transaction.setReceived(transaction.getBrokerAmount()); //*Math.random());
			transaction.setRemains(transaction.getBrokerAmount()-transaction.getReceived());
			
			if(transaction.getRemains() == 0) {
				transaction.setFilledAmount(transaction.getBrokerAmount());
			}
			
			Trade trade = new Trade();
			trade.setLive(false);
			trade.setOrderId(transaction.getOrderId());
			trade.setAmount(transaction.getReceived());
			trade.setTime(unixTime);
			
			tradeRepository.save(trade);
			
			executeTransaction(transaction);
			
			response.setSuccess(1);
			
		}
		
		return response;
		
	}
	
	
	private void executeTransaction(Transaction transaction) {
		
		Double brokerFeeFactor = 1-BtceApi.transactionFee;
		
		transaction.setFinalAmount(transaction.getBrokerAmount()*brokerFeeFactor);
		
		if(transaction.getType().equals("buy")) {
			
			Double usdVal = transaction.getAmount() * transaction.getRate();
			
			tradeStats.setFundsLeft(tradeStats.getFundsLeft() - usdVal);
			tradeStats.setFundsRight(tradeStats.getFundsRight() + transaction.getFinalAmount());
			
		} else if(transaction.getType().equals("sell")) {
			
			Double usdVal = transaction.getFinalAmount() * transaction.getRate();
			
			tradeStats.setFundsLeft(tradeStats.getFundsLeft() + usdVal);
			tradeStats.setFundsRight(tradeStats.getFundsRight() - transaction.getAmount());
			
		}
		
		Transaction reversedTransaction = transaction.getReversedTransaction();
		System.out.println("exec tx (reverse="+(reversedTransaction != null)+", fill="+transaction.getFilledAmount()+"/broker="+transaction.getBrokerAmount()+")");
		
		if(reversedTransaction != null) {
			
			Trade trade = new Trade();
			trade.setAmount(transaction.getFilledAmount());
			Double tradeRevenue = transaction.calcTradeRevenue(trade);
			
			tradeStats.setProfitLeft(tradeStats.getProfitLeft() + tradeRevenue);
			reversedTransaction.setIsReversed(true);
			reversedTransaction.setFilledAmount(transaction.getFilledAmount());
			
			if(transaction.getFilledAmount() < transaction.getBrokerAmount()) {
				transactionRepository.save(reversedTransaction);
				transactionRepository.save(transaction);
			} else {
				transactionRepository.delete(reversedTransaction);
				//transactionRepository.delete(transaction);
			}
			
		} else {
			
			if(transaction.getSave()) {
				transactionRepository.save(transaction);
			}
			
		}
		
		tradeStatsRepository.save(tradeStats);
		
	}
	
	
	protected Double actualTradeRate(String type) {
		
		if(type == "buy") {
			return tradeStats.getRate().getBuy() - tradeStats.getAutoTradingOptions().getRateBuffer();
		} else if(type == "sell") {
			return tradeStats.getRate().getSell() + tradeStats.getAutoTradingOptions().getRateBuffer();
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
			BtceApi.createTransaction(tradeStats.getCurrencyRight()+"_"+tradeStats.getCurrencyLeft(), transaction.getAmount(), actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.setReversedTransaction(transaction);
		
		return reverseTransaction;
		
	}
	
	
}
