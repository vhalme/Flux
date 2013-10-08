package com.lenin.project.service;

import java.util.Date;
import java.util.HashMap;
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
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AccountFunds;
import com.lenin.tradingplatform.data.entities.AutoTradingOptions;
import com.lenin.tradingplatform.data.entities.Order;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.Settings;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.OrderRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/tradingsession")
public class TradingSessionService {

	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TradingSessionRepository tradingSessionRepository;
	
	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private AuthComponent authComponent;
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	
	public TradingSessionService() {
	}
	

	@GET
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getTradingSession(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId) {

		RequestResponse response = authComponent.getInitialResponse(username, authToken, mc.getHttpServletRequest().getRemoteAddr(), false);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		Map<String, Object> resultObj = new HashMap<String, Object>();

		if (tradingSessionId != null) {
			
			MongoOperations mongoOps = (MongoOperations)mongoTemplate;
			List<Settings> settingsResult = mongoOps.findAll(Settings.class);
			Settings settings = settingsResult.get(0);
			
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			List<Order> orders = orderRepository.findByTradingSession(tradingSession);
			
			User user = userRepository.findByUsername(username);
			AccountFunds accountFunds = user.getAccountFunds(); 
			Map<String, Double> activeFundsMap = accountFunds.getActiveFunds().get(tradingSession.getService());
			
			resultObj.put("session", tradingSession);
			resultObj.put("orders", orders);
			resultObj.put("accountFunds", accountFunds);
			resultObj.put("serviceFees", settings.getServiceFees());
			
			response.setData(resultObj);
			
		} else {
			
			List<TradingSession> tradingSessions = tradingSessionRepository.findAll();
			response.setData(tradingSessions);
		
		}

		response.setSuccess(1);

		return response;

	}

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse saveUserDetails(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			TradingSession tradingSession) {
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		TradingSession dbTradingSession = tradingSessionRepository.findOne(tradingSession
				.getId());

		if (dbTradingSession.getRate() != null) {
			Long rateTime = dbTradingSession.getRate().getTime();
			tradingSession.getRate().setTime(rateTime);
		}
		
		
		tradingSessionRepository.save(tradingSession);
		
		response.setData(tradingSession);
		response.setSuccess(1);
		
		return response;

	}

	@POST
	@Path("/")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse addTradingSession(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			String session) {

		System.out.println("new session: " + session);
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		User user = userRepository.findByUsername(username);
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		Query searchRates = new Query(Criteria.where("setType").is("15s")).with(new Sort(Direction.DESC, "time")).limit(3);
		List<Rate> rates = mongoOps.find(searchRates, Rate.class);
		
		HashMap<String, Rate> rateMap = new HashMap<String, Rate>();
		for(Rate rate : rates) {
			rateMap.put(rate.getPair(), rate);
			System.out.println("Last rate: "+rate.getPair()+"="+rate.getLast()+", "+rate.getMovingAverages().size());
		}
		
		String[] sessionValues = session.split("_");
		TradingSession tradingSession = new TradingSession();
		//tradingSession.setUser(user);
		
		Double chunkSize = 0.0;
		if(sessionValues[0].equals("ltc")) {
			chunkSize = 10.0;
		} else if(sessionValues[0].equals("btc")) {
			chunkSize = 0.2;
		}
		
		String currencyPair = sessionValues[0]+"_"+sessionValues[1];
		Rate rate = rateMap.get(currencyPair);
		
		AutoTradingOptions autoTradingOptions = new AutoTradingOptions();
		
		autoTradingOptions.setBuyChunk(chunkSize);
		autoTradingOptions.setSellChunk(chunkSize);
		autoTradingOptions.setBuyThreshold(5.0);
		autoTradingOptions.setSellThreshold(5.0);
		autoTradingOptions.setBuyCeiling(rate.getLast());
		autoTradingOptions.setSellFloor(rate.getLast());
		
		tradingSession.setAutoTradingOptions(autoTradingOptions);
		tradingSession.setCurrencyRight(sessionValues[0]);
		tradingSession.setCurrencyLeft(sessionValues[1]);
		tradingSession.setLive(user.getLive());
		tradingSession.setService(sessionValues[2]);
		tradingSession.setProfitLeft(0.0);
		tradingSession.setProfitLeftSince(new Date());
		tradingSession.setProfitRight(0.0);
		tradingSession.setProfitRightSince(new Date());
		
		tradingSession.setRate(rate);

		System.out.println("Added new tradestats: "
				+ tradingSession.getCurrencyRight() + "/"
				+ tradingSession.getCurrencyLeft());

		tradingSession = tradingSessionRepository.save(tradingSession);

		user.addTradingSession(tradingSession);
		userRepository.save(user);

		response.setData(tradingSession);
		response.setSuccess(1);
		return response;

	}

	
	@DELETE
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteTradingSession(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			TradingSession tradingSession) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		if (tradingSessionId != null) {

			tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();

			User user = userRepository.findByUsername(username);
			List<TradingSession> tradingSessionList = user.getTradingSessions();
			System.out.println("Deleting from " + tradingSessionList.size()
					+ " tabs");

			int index = -1;
			for (int i = 0; i < tradingSessionList.size(); i++) {
				if (tradingSessionList.get(i).getId().equals(tradingSession.getId())) {
					index = i;
					break;
				}
			}

			if (index != -1) {
				System.out.println("Deleting tradeStat " + tradingSessionId
						+ " at " + index);
				tradingSessionList.remove(index);
			}

			System.out.print("Remaining tradingSession size "
					+ tradingSessionList.size() + " ... ");
			user.setTradingSessions(tradingSessionList);
			
			if (tradingSessionList.size() > 0) {
				user.setCurrentTradingSession(tradingSessionList.get(0));
			}

			user = userRepository.save(user);
			System.out.println(user.getTradingSessions().size());

			tradingSessionRepository.delete(tradingSession);

			response.setSuccess(1);
			response.setData(user.getTradingSessions());

		}

		return response;

	}

	@POST
	@Path("/funds")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse setFunds(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			@QueryParam("left") Double left, @QueryParam("right") Double right) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		User user = userRepository.findByUsername(username);
		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		AccountFunds accountFunds = user.getAccountFunds(); 
		Map<String, Double> activeFundsMap = accountFunds.getActiveFunds().get(tradingSession.getService());
		
		if (left != null) {

			Double tsFundsLeft = tradingSession.getFundsLeft();
			String tsCurrencyLeft = tradingSession.getCurrencyLeft();
			Double userFundsLeft = activeFundsMap.get(tsCurrencyLeft);
			Double changeLeft = tsFundsLeft - left;

			userFundsLeft = userFundsLeft + changeLeft;
			
			if (userFundsLeft >= 0 || user.getLive() == false) {
				
				tradingSession.setFundsLeft(left);
				
				if(user.getLive() == true) {
					activeFundsMap.put(tsCurrencyLeft, userFundsLeft);
					//user.setFunds(fundsMap);
					//userRepository.save(user);
					mongoOps.save(accountFunds);
				}
				
				tradingSessionRepository.save(tradingSession);
				response.setSuccess(1);
				response.setData(activeFundsMap);
				
			} else {
				
				response.setMessage("Not enough funds");
				response.setData(tradingSession.getFundsLeft()+"_"+tradingSession.getFundsRight());
			
			}

		}

		if (right != null) {

			Double tsFundsRight = tradingSession.getFundsRight();
			String tsCurrencyRight = tradingSession.getCurrencyRight();
			Double userFundsRight = activeFundsMap.get(tsCurrencyRight);
			Double changeRight = tsFundsRight - right;

			userFundsRight = userFundsRight + changeRight;

			if (userFundsRight >= 0 || user.getLive() == false) {
				
				tradingSession.setFundsRight(right);
				
				if(user.getLive() == true) {
					activeFundsMap.put(tsCurrencyRight, userFundsRight);
					//user.setFunds(fundsMap);
					//userRepository.save(user);
					mongoOps.save(accountFunds);
				}
				
				tradingSessionRepository.save(tradingSession);
				response.setSuccess(1);
				response.setData(activeFundsMap);
				
			} else {
				
				response.setMessage("Not enough funds");
				response.setData(tradingSession.getFundsLeft()+"_"+tradingSession.getFundsRight());
			
			}

		}

		return response;

	}
	
	
	@PUT
	@Path("/autotradingoptions")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse saveAutoTradingOptions(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			AutoTradingOptions autoTradingOptions) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);
		tradingSession.setAutoTradingOptions(autoTradingOptions);
		
		User user = userRepository.findByUsername(username);
		user.setCurrentTradingSession(tradingSession);
		userRepository.save(user);
		
		System.out.println("saveTradingOptions: "+autoTradingOptions.getBuyChunk()+"/"+autoTradingOptions.getSellChunk());
		tradingSessionRepository.save(tradingSession);

		response.setSuccess(1);
		response.setData(autoTradingOptions);

		return response;

	}
	
	
	@GET
	@Path("/resetprofit")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse resetProfit(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId, @QueryParam("profitSide") String profitSide) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);
		if(profitSide.equals("right")) {
			tradingSession.setProfitRight(0.0);
			tradingSession.setProfitRightSince(new Date());
		} else if(profitSide.equals("left")) {
			tradingSession.setProfitLeft(0.0);
			tradingSession.setProfitLeftSince(new Date());
		} 
		
		tradingSessionRepository.save(tradingSession);
		response.setSuccess(1);
		
		return response;

	}
	

}
