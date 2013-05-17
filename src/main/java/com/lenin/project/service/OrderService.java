package com.lenin.project.service;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.client.TradingClient;
import com.lenin.tradingplatform.data.entities.Order;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.OrderRepository;
import com.lenin.tradingplatform.data.repositories.TradeRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/order")
public class OrderService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private TradingSessionRepository tradingSessionRepository;
	
	@Autowired
	private TradeRepository tradeRepository;
	

	public OrderService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public List<Order> getOrders(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			@QueryParam("type") String type) {

		if (type != null) {
			User user = userRepository.findByUsername(userId);
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			user.setCurrentTradingSession(tradingSession);
			return orderRepository.findByTradingSessionAndType(tradingSession,
					type);
		} else if (userId != null) {
			User user = userRepository.findByUsername(userId);
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			user.setCurrentTradingSession(tradingSession);
			return orderRepository.findByTradingSession(tradingSession);
		} else {
			return orderRepository.findAll();
		}

	}

	@DELETE
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteOrder(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId, Order order) {

		orderRepository.delete(order);
		order = orderRepository.findOne(order.getId());

		RequestResponse response = new RequestResponse();

		if (order == null) {
			response.setSuccess(1);
		} else {
			response.setSuccess(0);
		}

		List<Order> orders = getOrders(userId, tradingSessionId, null);
		response.setData(orders);

		return response;

	}

	
	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse postOrder(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			Order order, @QueryParam("cancel") String cancel) {

		RequestResponse response = new RequestResponse();

		User user = userRepository.findByUsername(userId);
		if (user == null) {
			response.setSuccess(0);
			response.setMessage("Could not read user data.");
			return response;
		}

		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
		user.setCurrentTradingSession(tradingSession);

		if (tradingSession.getRate().getLast() == 0.0) {
			response.setSuccess(0);
			response.setMessage("Rate not set");
			return response;
		}

		TradingClient tradingClient = new TradingClient(tradingSession,
				tradingSessionRepository, orderRepository, tradeRepository);

		if (cancel == null) {
			response = tradingClient.trade(order);
		} else {
			response = tradingClient.cancelOrder(order);
		}

		List<Order> orders = getOrders(userId, tradingSessionId, null);
		response.setData(orders);

		return response;

	}
	

}
