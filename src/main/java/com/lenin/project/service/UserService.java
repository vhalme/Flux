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

import com.lenin.project.AuthComponent;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AccountFunds;
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

	@Autowired
	private AuthComponent authComponent;
	

	public UserService() {
	}
	
	
	@POST
	@Path("/funds")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse postFunds(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("currency") String currency,
			@QueryParam("amount") Double amount) {

		RequestResponse response = authComponent.getInitialResponse(username, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		User user = userRepository.findByUsername(username);
		
		AccountFunds accountFunds = user.getAccountFunds();
		Map<String, Double> reserves = accountFunds.getReserves();
		reserves.put(currency, reserves.get(currency) + amount);
		accountFunds.setReserves(reserves);

		user = userRepository.save(user);
		
		response.setData(user);
		response.setSuccess(1);
		
		return response;

	}
	
	
	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse listUsers(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId) {
		
		RequestResponse response = authComponent.getInitialResponse(username, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		if(username != null) {

			User user = userRepository.findByUsername(username);

			if (tradingSessionId != null) {
				List<TradingSession> tradingSessionList = user.getTradingSessions();
				if (tradingSessionList.size() > 0) {
					user.setCurrentTradingSession(tradingSessionList.get(0));
				}
			}

			List<User> users = new ArrayList<User>();
			users.add(user);
			
			response.setData(users);
			response.setSuccess(1);
			
			return response;

		} else {

			List<User> users = userRepository.findAll();

			response.setData(users);
			response.setSuccess(1);
			
			return response;

			
		}

	}

}
