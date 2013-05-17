package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
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
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/user")
public class UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TradingSessionRepository tradingSessionRepository;


	public UserService() {
	}
	
	
	@POST
	@Path("/funds")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse postFunds(@HeaderParam("User-Id") String userId,
			@QueryParam("currency") String currency,
			@QueryParam("amount") Double amount) {

		RequestResponse response = new RequestResponse();

		User user = userRepository.findByUsername(userId);
		
		Map<String, Double> userFunds = user.getFunds();
		userFunds.put(currency, userFunds.get(currency) + amount);
		user.setFunds(userFunds);

		user = userRepository.save(user);
		
		response.setData(user);
		response.setSuccess(1);
		
		return response;

	}
	
	
	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public List<User> listUsers(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId) {

		if (userId != null) {

			User user = userRepository.findByUsername(userId);

			if (tradingSessionId != null) {
				List<TradingSession> tradingSessionList = user.getTradingSessions();
				if (tradingSessionList.size() > 0) {
					user.setCurrentTradingSession(tradingSessionList.get(0));
				}
			}

			List<User> users = new ArrayList<User>();
			users.add(user);

			return users;

		} else {

			return userRepository.findAll();

		}

	}

}
