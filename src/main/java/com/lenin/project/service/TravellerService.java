package com.lenin.project.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

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

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.lenin.project.domain.RateQuote;
import com.lenin.project.domain.Trade;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.TradeRepository;
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
	
	private Long lastTradeTime = 0L;
	
	
	public TravellerService() {
		
	}
	
	@Scheduled(fixedDelay = 15000)
	public void update() {
		
		BtceApi.updateRates();
		
		List<Trade> savedTrades = tradeRepository.findAll();
		for(Trade trade : savedTrades) {
			if(trade.getTime() > lastTradeTime) {
				lastTradeTime = trade.getTime();
			}
		}
		
		JSONObject tradeListResult = BtceApi.getTradeList(lastTradeTime);
		
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
					trade.setOrderId(orderId);
					trade.setPair(pair);
					trade.setAmount(amount);
					trade.setRate(rate);
					trade.setType(type);
					trade.setTime(time);
					
					if(time > lastTradeTime) {
						lastTradeTime = time;
					}
					
				}
				
				tradeRepository.save(trades);
				
			}
			
		} catch(Exception e) {
			e.printStackTrace();
		}

		JSONObject orderListResult = BtceApi.getOrderList();
		
		try {
			
			if(orderListResult.getInt("success") == 1) {
				
				JSONObject orderListResultData = orderListResult.getJSONObject("return");
				Iterator<String> orderIds = orderListResultData.keys();
				
				while(orderIds.hasNext()) {
					
					String orderId = orderIds.next();
					JSONObject order = orderListResultData.getJSONObject(orderId);
					
					Transaction transaction = transactionRepository.findByOrderId(orderId);
					List<Trade> trades = tradeRepository.findByOrderId(orderId);
					
					Double amount = 0.0;
					for(Trade trade : trades) {
						amount += trade.getAmount();
					}
					
					transaction.setFilledAmount(amount);
					
					System.out.println(orderId);
				}
				
				
			}
			
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		
		
		

		List<User> users = userRepository.findAll();
		
		for(User user : users) {
			
			if(user.getLive() == true) {
				
				user.setCurrentRate(BtceApi.currentRateLtcUsd);
				user.setCurrentBuyRate(BtceApi.currentBuyRateLtcUsd);
				user.setCurrentSellRate(BtceApi.currentSellRateLtcUsd);
				user.setCurrentRate(BtceApi.currentRateLtcUsd);
				
			}
			
			Boolean resetOldRate =
					( (user.getCurrentRate() - user.getOldRate() > user.getProfitTarget()) && 
					user.getCurrentRate() < user.getBuyCeiling() ) ||
					( (user.getCurrentRate() - user.getOldRate() < -user.getProfitTarget()) &&
					user.getCurrentRate() > user.getSellFloor() );
			
			if(user.getOldRate() == 0.0 || resetOldRate) {
				user.setOldRate(user.getCurrentRate());
			}
			
			userRepository.save(user);
			
			List<Transaction> transactions = transactionRepository.findByUser(user);
			for(Transaction transaction : transactions) {
				if(transaction.getRemains() > 0) {
				}
			}
			
			if(user.getTradeAuto() == true && user.getCurrentRate() != 0.0) {
				AutoTrader autoTrader = new AutoTrader(user, userRepository, transactionRepository);
				autoTrader.autoTrade();
			}
			
		}
		
		
	}
	
	
	@GET
	@Path("/rates")
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse getRates(@HeaderParam("User-Id") String userId) {
		
		User user = userRepository.findByUsername(userId);
		
		RequestResponse response = new RequestResponse();
		
		RateQuote rateQuote = new RateQuote();
    	rateQuote.setDate(new Date());
    	
		if(user.getLive()) {
		
	    	rateQuote.setPair("ltc_usd");
	    	rateQuote.setLast(BtceApi.currentRateLtcUsd);
	    	rateQuote.setBuy(BtceApi.currentBuyRateLtcUsd);
	    	rateQuote.setSell(BtceApi.currentSellRateLtcUsd);

	    	response.setSuccess(1);
			response.setData(rateQuote);
			
		} else {
			
			rateQuote.setPair("ltc_usd");
	    	rateQuote.setLast(BtceApi.currentRateLtcUsd);
	    	rateQuote.setBuy(BtceApi.currentBuyRateLtcUsd);
	    	rateQuote.setSell(BtceApi.currentSellRateLtcUsd);
	    	
			response.setSuccess(1);
			response.setData(rateQuote);
			
		}

	    	    
		return response;
		
	}
	
	
	@GET
	@Path("/info")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse getInfo(@HeaderParam("User-Id") String userId) {
		
		RequestResponse response = new RequestResponse();
		User user = userRepository.findByUsername(userId);
		
		if(user == null) {
			response.setSuccess(0);
			response.setMessage("Could not read user data.");
			return response;
		}
		
		if(user.getLive()) {
			
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
					
					user.setLtc(funds.getDouble("ltc"));
					user.setUsd(funds.getDouble("usd"));
					
					user = userRepository.save(user);
					
					response.setData(user);
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				
				response.setSuccess(-1);
				response.setMessage(e.getMessage());
				
			}
			
			
		} else {
			
			response.setSuccess(1);
			response.setData(user);
			
		}
		
		return response;
		
		
	}
	
	
	@GET
    @Path("/transaction")
	@Produces({ MediaType.APPLICATION_JSON })
    public List<Transaction> getTransactions(@HeaderParam("User-Id") String userId, @QueryParam("type") String type) {
        
		User user = userRepository.findByUsername(userId);
		
		if(type != null) {
			return transactionRepository.findByUserAndType(user, type);
		} else if(user != null) {
			return transactionRepository.findByUser(user);
		} else {
			return transactionRepository.findAll();
		}
		
	}
	
	
	@DELETE
	@Path("/transaction")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteTransaction(@HeaderParam("User-Id") String userId, Transaction transaction) {
		
		transactionRepository.delete(transaction);
		transaction = transactionRepository.findOne(transaction.getId());
		
		RequestResponse response = new RequestResponse();
		
		if(transaction == null) {
			response.setSuccess(1);
		} else {
			response.setSuccess(0);
		}
		
		List<Transaction> transactions = getTransactions(userId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	@POST
	@Path("/transaction")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse postTransaction(@HeaderParam("User-Id") String userId, Transaction transaction) {
		
		RequestResponse response = new RequestResponse();
		
		User user = userRepository.findByUsername(userId);
		
		if(user == null) {
			response.setSuccess(0);
			response.setMessage("Could not read user data.");
			return response;
		}
		
		if(user.getCurrentRate() == 0.0) {
			response.setSuccess(0);
			response.setMessage("Rate not set");
			return response;
		}
		
		
		UserTrader userTrader = new UserTrader(user, userRepository, transactionRepository);
		
		response = userTrader.trade(transaction);
		
		List<Transaction> transactions = getTransactions(userId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.TEXT_PLAIN })
    public String test(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		
        return "";
    
	}
	
	@GET
	@Path("/funds")
    @Produces({ MediaType.TEXT_PLAIN })
	public String changeFunds(@HeaderParam("User-Id") String userId,
			@QueryParam("fund") String fund, @QueryParam("change") Double change) {
		
		User user = userRepository.findByUsername(userId);
		user.setFunds(fund, user.getFunds(fund) + change);
		
		userRepository.save(user);
		
		return "OK";
		
	}
	
	@POST
	@Path("/rate")
	@Consumes({ MediaType.TEXT_PLAIN })
    @Produces({ MediaType.APPLICATION_JSON })
	public User setRate(@HeaderParam("User-Id") String userId,
			@QueryParam("rate") Double rate, String rateStr) {
		
		User user = userRepository.findByUsername(userId);
		user.setCurrentRate(rate);
		user.setCurrentBuyRate(rate);
		user.setCurrentSellRate(rate);
		
		if(user.getOldRate() == 0.0) {
			user.setOldRate(rate);
		}
		
		return user;
		
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
		
		userRepository.save(testUser1);
		
		User testUser2 = new User();
		testUser2.setUsername("testUser456");
		testUser2.setLive(true);
		
		userRepository.save(testUser2);
		
        return result;
    
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
    public List<User> listUsers() {
        
		return userRepository.findAll();
	
	}
	
	@PUT
    @Path("/user")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
    public User saveUserDetails(@HeaderParam("User-Id") String userId, User user) {
        
		User dbUser = userRepository.findByUsername(userId);
		
		dbUser.setProfitTarget(user.getProfitTarget());
		dbUser.setRateBuffer(user.getRateBuffer());
		dbUser.setBuyCeiling(user.getBuyCeiling());
		dbUser.setSellFloor(user.getSellFloor());
		dbUser.setTradeChunk(user.getTradeChunk());
		dbUser.setTradeAuto(user.getTradeAuto());
		dbUser.setAutoTradingModel(user.getAutoTradingModel());
		dbUser.setCurrentRate(user.getCurrentRate());
		dbUser.setCurrentBuyRate(user.getCurrentBuyRate());
		dbUser.setCurrentSellRate(user.getCurrentSellRate());
		
		userRepository.save(dbUser);
		
		return dbUser;
		
	}
	
	
	@GET
    @Path("/deleteall")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteAll() {
		
		transactionRepository.deleteAll();
		userRepository.deleteAll();
		commentRepository.deleteAll();
		
		return "OK";
    
	}
	
	
}

