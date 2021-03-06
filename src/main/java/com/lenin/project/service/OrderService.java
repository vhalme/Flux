package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.bson.types.ObjectId;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.lenin.project.ApiFactory;
import com.lenin.project.AuthComponent;
import com.lenin.tradingplatform.client.BtceApi;
import com.lenin.tradingplatform.client.BtceTradingClient;
import com.lenin.tradingplatform.client.ExchangeApi;
import com.lenin.tradingplatform.client.MtgoxApi;
import com.lenin.tradingplatform.client.MtgoxTradingClient;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.client.TestTradingClient;
import com.lenin.tradingplatform.client.TradingClient;
import com.lenin.tradingplatform.data.entities.AccountFunds;
import com.lenin.tradingplatform.data.entities.Order;
import com.lenin.tradingplatform.data.entities.PropertyMap;
import com.lenin.tradingplatform.data.entities.Settings;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.OrderRepository;
import com.lenin.tradingplatform.data.repositories.RateRepository;
import com.lenin.tradingplatform.data.repositories.TradeRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/order")
public class OrderService {

	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private TradingSessionRepository tradingSessionRepository;
	
	@Autowired
	private TradeRepository tradeRepository;
	
	@Autowired
	private RateRepository rateRepository;
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@Autowired
	private AuthComponent authComponent;
	
	
	public OrderService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getOrders(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			@QueryParam("type") String type) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		List<Order> orders = queryOrders(username, tradingSessionId, type);
		
		response.setData(orders);
		response.setSuccess(1);
		
		return response;
		

	}
	
	
	private List<Order> queryOrders(String username, String tradingSessionId, String type) {

		if(type != null) {
			
			User user = userRepository.findByUsername(username);
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			//user.setCurrentTradingSession(tradingSession);
			
			List<Order> orders = orderRepository.findByTradingSessionAndType(tradingSession, type);
			return orders;
			
		} else if(username != null) {
			
			User user = userRepository.findByUsername(username);
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			//user.setCurrentTradingSession(tradingSession);
			
			List<Order> orders = orderRepository.findByTradingSession(tradingSession);
			return orders;
			
		} else {
			
			List<Order> orders = orderRepository.findAll();
			return orders;
		}
		

	}
	

	@DELETE
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteOrder(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId, Order order) {
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		orderRepository.delete(order);
		order = orderRepository.findOne(order.getId());

		if(order == null) {
			response.setSuccess(1);
		}
		
		List<Order> orders = queryOrders(username, tradingSessionId, null);
		response.setData(orders);
		
		return response;

	}
	
	
	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse postOrder(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId,
			Order order, @QueryParam("cancel") String cancel) {
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		User user = userRepository.findByUsername(username);
		if (user == null) {
			response.setMessage("Could not read user data.");
			return response;
		}
		
		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
		//user.setCurrentTradingSession(tradingSession);
		
		if (tradingSession.getRate().getLast() == 0.0) {
			response.setMessage("Rate not set");
			return response;
		}
		
		AccountFunds accountFunds = user.getAccountFunds();
		Map<String, PropertyMap> propertyMaps = accountFunds.getServiceProperties();
		PropertyMap servicePropertyMap = propertyMaps.get(tradingSession.getService());
		Map<String, Object> serviceProperties = servicePropertyMap.getProperties();
		String apiKey = (String)serviceProperties.get("apiKey");
		String apiSecret = (String)serviceProperties.get("apiSecret");
		
		Double fundsLeft = tradingSession.getFundsLeft();
		Double fundsRight = tradingSession.getFundsRight();
		
		if(cancel == null) {
		
			if(order.getType().equals("buy")) {
				if(fundsLeft < order.getAmount()*order.getRate()) {
					response.setSuccess(-5);
					response.setMessage(tradingSession.getCurrencyLeft().toUpperCase()+" funds insufficient for this order.");
					return response;
				}
			} else if(order.getType().equals("sell")) {
				if(fundsRight < order.getAmount()) {
					response.setSuccess(-5);
					response.setMessage(tradingSession.getCurrencyRight().toUpperCase()+" funds insufficient for this order.");
					return response;
				}
			}
			
		}
		
		order.setService(tradingSession.getService());
		
		ExchangeApi exchangeApi = null;
		TradingClient tradingClient = null;
		
		
		ApiFactory apiFactory = new ApiFactory();
		apiFactory.setMongoTemplate(mongoTemplate);
		
		if(tradingSession.getService().equals("btce")) {
			
			tradingClient = new BtceTradingClient(tradingSession, mongoTemplate);
			BtceApi btceApi = apiFactory.createBtceApi(user);
			exchangeApi = btceApi;
			
		} else if(tradingSession.getService().equals("mtgox")) {
			
			tradingClient = new MtgoxTradingClient(tradingSession, mongoTemplate);
			MtgoxApi mtgoxApi = apiFactory.createMtgoxApi(user);
			exchangeApi = mtgoxApi;
			
		} else {
			
			tradingClient = new TestTradingClient(tradingSession, mongoTemplate);
			
		}
			
		tradingClient.setExchangeApi(exchangeApi);
		
		RequestResponse tradeResponse = null;
		
		if(cancel == null) {
			order.setMode("manual");
			tradeResponse = tradingClient.trade(order);
		} else {
			tradeResponse = tradingClient.cancelOrder(order);
		}
		
		if(tradeResponse != null && tradeResponse.getSuccess() > 0) {
			
			List<Order> orders = queryOrders(username, tradingSessionId, null);
			
			response.setData(orders);
			response.setSuccess(1);
			
		} else {
			
			response.setSuccess(tradeResponse.getSuccess());
			response.setMessage(tradeResponse.getMessage());
			
		}

		return response;
		

	}
	
	@GET
	@Path("/test")
	@Produces({ MediaType.APPLICATION_JSON })
	public List<String> test(@QueryParam("user") String username, @QueryParam("from") String from, @QueryParam("from") String to) {
		
		List<String> result = new ArrayList<String>();
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		List<Settings> settingsResult = mongoOps.findAll(Settings.class);
		
		Settings settings = settingsResult.get(0);
		BtceApi btceApi = new BtceApi(settings.getBtceApiKey(), settings.getBtceApiSecret(), mongoOps);
		btceApi.setOrderFee(0.002);

		User user = userRepository.findByUsername(username);
		
		AccountFunds accountFunds = user.getAccountFunds();
		Map<String, PropertyMap> propertyMaps = accountFunds.getServiceProperties();
		PropertyMap servicePropertyMap = propertyMaps.get("btce");
		Map<String, Object> serviceProperties = servicePropertyMap.getProperties();
		String apiKey = (String)serviceProperties.get("apiKey");
		String apiSecret = (String)serviceProperties.get("apiSecret");
		btceApi.setKey(apiKey);
		btceApi.setSecret(apiSecret);
		
		
		JSONObject resultJson = btceApi.getTradeList(new Long(from));
		
		if(resultJson != null) {
			String str = resultJson.toString();
			result.add(str);
		}
		
		return result;
		
	}
}
