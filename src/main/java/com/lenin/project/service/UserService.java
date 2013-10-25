package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.project.util.PasswordHash;
import com.lenin.tradingplatform.client.EmailSender;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AccountFunds;
import com.lenin.tradingplatform.data.entities.PropertyMap;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/user")
public class UserService {
	
	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
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

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
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
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
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
	
	
	@POST
	@Path("/serviceproperties")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse setServiceProperties(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("service") String service, PropertyMap propertyMap) {

		System.out.println("Set service properties for user "+username);
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		int success = 1;
		
		User user = userRepository.findByUsername(username);
		
		Map<String, Object> properties = propertyMap.getProperties();
		Set<String> keys = properties.keySet();
		
		AccountFunds accountFunds = user.getAccountFunds();
		Map<String, Object> dbProperties = 
				accountFunds.getServiceProperties().get(service).getProperties();
		
		for(String key : keys) {
			
			dbProperties.put(key, properties.get(key));
			
			/*
			if(key.equals("nextMethod")) {
				String currentMethod = (String)dbProperties.get("method");
				if(currentMethod == null || currentMethod.length() == 0) {
					dbProperties.put("method", properties.get("nextMethod"));
					dbProperties.put("currency", properties.get("nextCurrency"));
					success = 2;
				}
			}
			*/
			
		}
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		mongoOps.save(accountFunds);
		
		response.setSuccess(success);
		response.setData(accountFunds.getServiceProperties().get(service));
		
		return response;
		
	}
	
	
	@DELETE
	@Path("{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteUser(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@PathParam("id") String userId) {
		
		System.out.println("delete user "+userId);
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		User user = userRepository.findOne(userId);
		
		if(user != null) {
			
			User testUser = userRepository.findByUsername(user.getUsername()+" (test)");
			user.setDeleted(true);
			user.setUsername(user.getUsername()+" [DELETED]");
			
			AccountFunds accountFunds = user.getAccountFunds();
			accountFunds.setDeleted(true);
			List<TradingSession> tradingSessions = user.getTradingSessions();
			for(TradingSession tradingSession : tradingSessions) {
				tradingSession.setDeleted(true);
			}
			
			userRepository.save(user);
			tradingSessionRepository.save(tradingSessions);
			
			((MongoOperations)mongoTemplate).save(accountFunds);
			
			testUser.setDeleted(true);
			testUser.setUsername(testUser.getUsername()+" [DELETED]");
			
			AccountFunds testAccountFunds = testUser.getAccountFunds();
			testAccountFunds.setDeleted(true);
			List<TradingSession> testTradingSessions = testUser.getTradingSessions();
			for(TradingSession testTradingSession : testTradingSessions) {
				testTradingSession.setDeleted(true);
			}
			
			userRepository.save(testUser);
			tradingSessionRepository.save(testTradingSessions);
			
			((MongoOperations)mongoTemplate).save(accountFunds);
			
			response.setSuccess(1);
			
		}
		
		return response;
		
	}
	
	
	@POST
	@Path("/reset")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse resetPassword(String recoveryToken) {
		
		RequestResponse response = new RequestResponse();
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		if(recoveryToken.indexOf("@") != -1) {
			
			String email = recoveryToken;
			
			Criteria criteria = Criteria.where("email").is(email);
			List<User> users = mongoOps.find(new Query(criteria), User.class);
			
			if(users.size() == 1) {
				
				User user = users.get(0);
				
				String text =
						"Hi!<br/><br/>"+
						"You have requested password reset for your BTC machines Trade account.<br/><br/>"+
						"Please, follow this link to set a new password:<br/>"+
						"<a href=\""+EmailSender.hostName+"/#/recover/"+user.getPassword()+"\">"+
						EmailSender.hostName+"/#/recover/"+user.getPassword()+"</a><br/><br/><br/>"+
						"Best regards,<br/>"+
						"BTC machines";
				
				Boolean emailSent = EmailSender.send(email, "Password reset requested", text);
				
				if(emailSent) {
					response.setSuccess(1);
					response.setMessage("Password recovery e-mail sent successfully.");
				} else {
					response.setSuccess(-1);
					response.setMessage("Password recovery failed due to technical problems. Try again later.");
				}
				
			} else {
				
				response.setSuccess(0);
				response.setMessage("E-mail address not found.");
				
			}
			
		} else {
		
			String[] new_old = recoveryToken.split("\t");
			String newPwd = new_old[0];
			String oldPwd = new_old[1];
			
			Criteria criteria = Criteria.where("password").is(oldPwd);
			List<User> users = mongoOps.find(new Query(criteria), User.class);
		
			if(users.size() == 1) {
			
				User user = users.get(0);
				System.out.println("user found! set new pwd: "+newPwd);
			
				String pwdHash = "";
			
				try {
				
					pwdHash = PasswordHash.createHash(newPwd);
				
				} catch(Exception e) {
					e.printStackTrace();
					response.setSuccess(-1);
					response.setMessage("Reset failed due to technical problems.");
					return response;
				}
			
				user.setPassword(pwdHash);
				userRepository.save(user);
			
				response.setSuccess(1);
				response.setMessage("Password reset successfully.");
			
			} else {
			
				System.out.println("user not found! hash: "+oldPwd);
			
				response.setSuccess(0);
				response.setMessage("Invalid recovery token");
		
			}
		
		}
		
		return response;
		
	}
	
}
