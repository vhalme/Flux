package com.lenin.project.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.lenin.project.domain.TickerQuote;
import com.lenin.project.domain.Trade;
import com.lenin.project.domain.TradeStats;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.TradeRepository;
import com.lenin.project.repositories.TradeStatsRepository;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;

@Service
@Path("/")
public class TravellerService {
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private TransactionRepository transactionRepository;
	
	@Autowired
	private TradeRepository tradeRepository;
	
	@Autowired
	private TradeStatsRepository tradeStatsRepository;
	
	
	private Long lastTradeTime = 0L;
	
	
	public TravellerService() {
		
	}
	
	@Scheduled(fixedDelay = 15000)
	public void update() {
		
		
		TickerQuote tickerLtcUsd = getTickerQuote("ltc_usd");
		TickerQuote tickerBtcUsd = getTickerQuote("btc_usd");
		TickerQuote tickerLtcBtc = getTickerQuote("ltc_btc");
		
		Map<String, TickerQuote> tickerMap = new HashMap<String, TickerQuote>();
		tickerMap.put("ltc_usd", tickerLtcUsd);
		tickerMap.put("btc_usd", tickerBtcUsd);
		tickerMap.put("ltc_btc", tickerLtcBtc);
		
		//System.out.println(tickerMap);
		
		updateTradeHistory();
		
		List<Transaction> transactions = transactionRepository.findAll();
		List<Transaction> changedTransactions = new ArrayList<Transaction>();
		
		for(Transaction transaction : transactions) {
			
			if(transaction.getFilledAmount() < transaction.getBrokerAmount() && transaction.getIsReversed() != true) {
				
				List<Trade> trades = tradeRepository.findByOrderId(transaction.getOrderId());
				
				Double amount = 0.0;
				
				if(trades.size() > 0) {
					
					for(Trade trade : trades) {
						amount += trade.getAmount();
					}
				
				}
				
				if(amount > transaction.getFilledAmount()) {
					
					Double amountChange = amount-transaction.getFilledAmount();
					
					transaction.setFilledAmount(amount);
					changedTransactions.add(transaction);
					
					Transaction reversedTransaction = transaction.getReversedTransaction();
					
					if(reversedTransaction != null) {
						
						Double totalFeeFactor = (1-UserTrader.transactionFee) * (1-BtceApi.transactionFee);
						
						reversedTransaction.setFilledAmount(transaction.getFilledAmount());
						changedTransactions.add(reversedTransaction);
						
						Trade trade = new Trade();
						trade.setAmount(amountChange);
						
						TradeStats tradeStats = transaction.getTradeStats();
						tradeStats.setProfitLeft(tradeStats.getProfitLeft() + (transaction.calcTradeRevenue(trade)*totalFeeFactor));
						tradeStatsRepository.save(tradeStats);
						
						if(transaction.getFilledAmount() >= transaction.getBrokerAmount()) {
							changedTransactions.remove(transaction);
							changedTransactions.remove(reversedTransaction);
							transactionRepository.delete(transaction);
							transactionRepository.delete(reversedTransaction);
						}
						
					}
					
				}
				
				
			}
			
			if(transaction.getLive() == false && transaction.getFilledAmount() < transaction.getBrokerAmount()) {
				
				Long unixTime = System.currentTimeMillis() / 1000L;
				
				Trade trade = new Trade();
				trade.setLive(false);
				trade.setOrderId(transaction.getOrderId());
				trade.setAmount(transaction.getBrokerAmount()-transaction.getFilledAmount());
				trade.setTime(unixTime);
				
				tradeRepository.save(trade);
				
			}
			
		}
		
		transactionRepository.save(changedTransactions);
		
		List<TradeStats> allTradeStats = tradeStatsRepository.findAll();
		
		for(TradeStats tradeStats : allTradeStats) {
			
			if(tradeStats.getLive() == true) {
				
				TickerQuote tickerQuote = tickerMap.get(tradeStats.getPair());
				
				//System.out.println("ticker for "+tradeStats.getPair()+": "+tickerQuote);
				
				if(tickerQuote != null) {
					tradeStats.setCurrentRate(tickerQuote.getLast());
					tradeStats.setCurrentBuyRate(tickerQuote.getBuy());
					tradeStats.setCurrentSellRate(tickerQuote.getSell());
				}
				
			}
			
			Boolean resetOldRate =
					( (tradeStats.getCurrentRate() - tradeStats.getOldRate() > tradeStats.getProfitTarget()) && 
							tradeStats.getCurrentRate() < tradeStats.getBuyCeiling() ) ||
					( (tradeStats.getCurrentRate() - tradeStats.getOldRate() < - tradeStats.getProfitTarget()) &&
							tradeStats.getCurrentRate() > tradeStats.getSellFloor() );
			
			if(tradeStats.getOldRate() == 0.0 || resetOldRate) {
				tradeStats.setOldRate(tradeStats.getCurrentRate());
			}
			
			tradeStatsRepository.save(tradeStats);
			
			System.out.println(tradeStats.getPair()+"("+tradeStats.getId()+"): "+tradeStats.getTradeAuto());
			
			if(tradeStats.getTradeAuto() == true && tradeStats.getCurrentRate() != 0.0) {
				AutoTrader autoTrader = new AutoTrader(tradeStats, tradeStatsRepository, transactionRepository, tradeRepository);
				autoTrader.autoTrade();
			}
			
		}
		
		
	}
	
	
	private TickerQuote getTickerQuote(String pair) {
		
		try {
		
			TickerQuote tickerQuote = new TickerQuote();
		
			JSONObject rates = BtceApi.getRates(pair);
			JSONObject ticker = rates.getJSONObject("ticker");
			tickerQuote.setLast(ticker.getDouble("last"));
			tickerQuote.setBuy(ticker.getDouble("buy"));
			tickerQuote.setSell(ticker.getDouble("sell"));
			tickerQuote.setTime(ticker.getLong("server_time"));
			
			return tickerQuote;
			
		} catch(Exception e) {
			
			e.printStackTrace();
			return null;
			
		}
    	
	}
	
	
	private void updateTradeHistory() {
		
		List<Trade> savedTrades = tradeRepository.findAll();
		for(Trade trade : savedTrades) {
			if(trade.getLive() == true && trade.getTime() > lastTradeTime) {
				lastTradeTime = trade.getTime();
			}
		}
		
		JSONObject tradeListResult = BtceApi.getTradeList(lastTradeTime+1);
		
		try {
			
			if(tradeListResult.getInt("success") == 1) {
				
				JSONObject tradeListResultData = tradeListResult.getJSONObject("return");
				Iterator<String> tradeIds = tradeListResultData.keys();
				
				List<Trade> trades = new ArrayList<Trade>();
				
				while(tradeIds.hasNext()) {
					
					String tradeId = tradeIds.next();
					JSONObject tradeData = tradeListResultData.getJSONObject(tradeId);
					
					String orderId = tradeData.getString("order_id");
					String pair = tradeData.getString("pair");
					Double amount = tradeData.getDouble("amount");
					Double rate = tradeData.getDouble("rate");
					String type = tradeData.getString("type");
					Long time = tradeData.getLong("timestamp");
					
					Trade trade = new Trade();
					trade.setLive(true);
					trade.setOrderId(orderId);
					trade.setPair(pair);
					trade.setAmount(amount);
					trade.setRate(rate);
					trade.setType(type);
					trade.setTime(time);
					
					trades.add(trade);
					
					if(time > lastTradeTime) {
						lastTradeTime = time;
					}
					
				}
				
				if(trades.size() > 0) {
					System.out.println("New trades: "+trades.size()+"; Last trade time: "+lastTradeTime);
					tradeRepository.save(trades);
				}
				
			} else {
				
				String error = tradeListResult.getString("error");
				if(!error.equals("no trades")) {
					System.out.println("Trades update unsuccessful: "+error);
				}
				
			}
			
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		
	}
	
	@GET
	@Path("/tradeStats")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse getTradeStats(@HeaderParam("User-Id") String userId,
    		@HeaderParam("TradeStats-Id") String tradeStatsId) {
		
		RequestResponse response = new RequestResponse();
		User user = userRepository.findByUsername(userId);
		TradeStats tradeStats = tradeStatsRepository.findOne(tradeStatsId); //user.getCurrentTradeStats();
		//user.setCurrentTradeStats(tradeStats);
		
		response.setSuccess(1);
		response.setData(tradeStats);
		
		return response;
		
	}
	
	@PUT
    @Path("/tradeStats")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
    public TradeStats saveUserDetails(@HeaderParam("User-Id") String userId, 
    		@HeaderParam("TradeStats-Id") String tradeStatsId, TradeStats tradeStats) {
        
		tradeStatsRepository.save(tradeStats);
		
		return tradeStats;
		
	}
	
	
	@GET
	@Path("/info")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse getAccountInfo(@HeaderParam("User-Id") String userId) {
		
		RequestResponse response = new RequestResponse();
		User user = userRepository.findByUsername(userId);
		
			
		JSONObject accountInfoResult = BtceApi.getAccountInfo();
			
		if(accountInfoResult == null) {
			response.setSuccess(0);
			response.setMessage("Could not get account info.");
			return response;
		}
			
		try {
				
			Integer success = accountInfoResult.getInt("success");
			response.setSuccess(success);
				
			if(success == 1) {
					
				JSONObject funds = 
						accountInfoResult
							.getJSONObject("return")
							.getJSONObject("funds");
					
				//tradeStats.setFundsRight(funds.getDouble(tradeStats.getCurrencyRight()));
				//tradeStats.setFundsLeft(funds.getDouble(tradeStats.getCurrencyLeft()));
					
				//tradeStatsRepository.save(tradeStats);
					
				//response.setData(user);
					
			}
				
		} catch(JSONException e) {
				
			e.printStackTrace();
				
			response.setSuccess(-1);
			response.setMessage(e.getMessage());
				
		}
			
		//response.setSuccess(1);
		response.setData(user);
		
		return response;
		
		
	}
	
	@GET
    @Path("/trade")
	@Produces({ MediaType.APPLICATION_JSON })
    public List<Trade> getTrades(@HeaderParam("User-Id") String userId, @QueryParam("orderId") String orderId) {
        
		if(orderId != null) {
			return tradeRepository.findByOrderId(orderId);
		} else {
			return tradeRepository.findAll();
		}
		
	}
	
	
	@GET
    @Path("/transaction")
	@Produces({ MediaType.APPLICATION_JSON })
    public List<Transaction> getTransactions(@HeaderParam("User-Id") String userId, 
    		@HeaderParam("TradeStats-Id") String tradeStatsId, @QueryParam("type") String type) {
        
		User user = userRepository.findByUsername(userId);
		TradeStats tradeStats = tradeStatsRepository.findOne(tradeStatsId); //user.getCurrentTradeStats();
		user.setCurrentTradeStats(tradeStats);
		
		if(type != null) {
			return transactionRepository.findByTradeStatsAndType(tradeStats, type);
		} else if(userId != null) {
			return transactionRepository.findByTradeStats(tradeStats);
		} else {
			return transactionRepository.findAll();
		}
		
	}
	
	
	@DELETE
	@Path("/transaction")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteTransaction(@HeaderParam("User-Id") String userId, 
			@HeaderParam("TradeStats-Id") String tradeStatsId, Transaction transaction) {
		
		transactionRepository.delete(transaction);
		transaction = transactionRepository.findOne(transaction.getId());
		
		RequestResponse response = new RequestResponse();
		
		if(transaction == null) {
			response.setSuccess(1);
		} else {
			response.setSuccess(0);
		}
		
		List<Transaction> transactions = getTransactions(userId, tradeStatsId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	@POST
	@Path("/transaction")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse postTransaction(@HeaderParam("User-Id") String userId, 
    		@HeaderParam("TradeStats-Id") String tradeStatsId, 
    		Transaction transaction, @QueryParam("cancel") String cancel) {
		
		RequestResponse response = new RequestResponse();
		
		User user = userRepository.findByUsername(userId);
		if(user == null) {
			response.setSuccess(0);
			response.setMessage("Could not read user data.");
			return response;
		}
		
		TradeStats tradeStats = tradeStatsRepository.findOne(tradeStatsId); //user.getCurrentTradeStats();
		user.setCurrentTradeStats(tradeStats);
		
		if(tradeStats.getCurrentRate() == 0.0) {
			response.setSuccess(0);
			response.setMessage("Rate not set");
			return response;
		}
		
		
		UserTrader userTrader = new UserTrader(tradeStats, tradeStatsRepository, transactionRepository, tradeRepository);
		
		if(cancel == null) {
			response = userTrader.trade(transaction);
		} else {
			response = userTrader.cancelOrder(transaction);
		}
		
		List<Transaction> transactions = getTransactions(userId, tradeStatsId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Transaction> test(@QueryParam("fromId") String tradeStatsId) {
		
		TradeStats tradeStats = tradeStatsRepository.findOne(tradeStatsId);
		List<Transaction> transactions = transactionRepository.findByTradeStatsAndType(tradeStats, "sell");
        
		return transactions;
    
	}
	
	@GET
	@Path("/funds")
    @Produces({ MediaType.TEXT_PLAIN })
	public String changeFunds(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradeStats-Id") String tradeStatsId,
			@QueryParam("fund") String fund, @QueryParam("change") Double change) {
		
		User user = userRepository.findByUsername(userId);
		TradeStats tradeStats = tradeStatsRepository.findOne(tradeStatsId); //user.getCurrentTradeStats();
		user.setCurrentTradeStats(tradeStats);
		
		user.setFunds(fund, user.getFunds(fund) + change);
		
		tradeStatsRepository.save(user.getCurrentTradeStats());
		
		return "OK";
		
	}
	
	
	@GET
    @Path("/init")
    @Produces({ MediaType.TEXT_PLAIN })
    public String initUsers(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		//System.out.println(fromId);
		//System.out.println(toId);
		
		String result = "test";
		
		deleteAll();
		
		User testUser1 = new User();
		testUser1.setUsername("testUser123");
		testUser1.setLive(false);
		
		TradeStats tradeStats1_1 = new TradeStats();
		tradeStats1_1.setCurrencyLeft("usd");
		tradeStats1_1.setCurrencyRight("ltc");
		tradeStats1_1.setLive(false);
		tradeStats1_1 = tradeStatsRepository.save(tradeStats1_1);
		
		TradeStats tradeStats1_2 = new TradeStats();
		tradeStats1_2.setCurrencyLeft("btc");
		tradeStats1_2.setCurrencyRight("ltc");
		tradeStats1_2.setLive(false);
		tradeStats1_2 = tradeStatsRepository.save(tradeStats1_2);
		
		testUser1.addTradeStats(tradeStats1_1);
		testUser1.addTradeStats(tradeStats1_2);
		testUser1.setCurrentTradeStats(tradeStats1_1);
		userRepository.save(testUser1);
		
		User testUser2 = new User();
		testUser2.setUsername("testUser456");
		testUser2.setLive(true);
		
		TradeStats tradeStats2 = new TradeStats();
		tradeStats2.setCurrencyLeft("usd");
		tradeStats2.setCurrencyRight("ltc");
		tradeStats2.setLive(true);
		tradeStats2 = tradeStatsRepository.save(tradeStats2);
		
		testUser2.addTradeStats(tradeStats2);
		testUser2.setCurrentTradeStats(tradeStats2);
		userRepository.save(testUser2);
		
		
        return result;
    
	}
	
	
	@GET
    @Path("/deltrades")
	@Produces({ MediaType.TEXT_PLAIN })
    public String delTrades(@HeaderParam("User-Id") String userId, @QueryParam("orderId") String orderId) {
        
		tradeRepository.deleteAll();
		
		return "OK";
		
	}
	
	
	@GET
    @Path("/deleteall")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteAll() {
		
		tradeStatsRepository.deleteAll();
		tradeRepository.deleteAll();
		transactionRepository.deleteAll();
		userRepository.deleteAll();
		commentRepository.deleteAll();
		
		return "OK";
    
	}
	
	
	
	@POST
    @Path("/register")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.TEXT_PLAIN })
    public String register(User user) {
        
		System.out.println("Registering user: "+user);
		
		userRepository.save(user);
		
		return "OK!";
    
	}
	
	
	@GET
    @Path("/user")
	@Produces({ MediaType.APPLICATION_JSON })
    public List<User> listUsers(@HeaderParam("User-Id") String userId, @HeaderParam("TradeStats-Id") String tradeStatsId) {
        
		if(userId != null) {
			
			User user = userRepository.findByUsername(userId);
			
			if(tradeStatsId != null) {
				user.setCurrentTradeStats(tradeStatsRepository.findOne(tradeStatsId));
			}
			
			List<User> users = new ArrayList<User>();
			users.add(user);
			
			return users;
		
		} else {
			
			return userRepository.findAll();
		
		}
		
	}
	
	
	
}

