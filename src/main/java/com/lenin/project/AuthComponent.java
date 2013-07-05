package com.lenin.project;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.User;

@Component
public class AuthComponent {

	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public AuthComponent() {
		
	}
	
	
	public RequestResponse getInitialResponse(String username, String authToken) {
		return getInitialResponse(username, authToken, true);
	}
	
	public RequestResponse getInitialResponse(String username, String authToken, Boolean resetSessionTime) {
		
		Long expirationTime = 900000L; // 15 minutes in ms.
		
		RequestResponse response = new RequestResponse();
		
		User user = null;
		List<User> usersResult = null;
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		Query query = new Query(Criteria.where("username").is(username).andOperator(Criteria.where("authToken").is(authToken)));
		usersResult = mongoOps.find(query, User.class);
		
		if(usersResult.size() == 1) {
			
			user = usersResult.get(0);
			
			Long lastActivityTime = user.getLastActivity();
			Long nowTime = System.currentTimeMillis();
			
			Long timeSinceLastActivity = nowTime - lastActivityTime;
			
			if(timeSinceLastActivity > expirationTime) {
				
				response.setSuccess(-1);
				
			} else {
				
				if(resetSessionTime) {
					user.setLastActivity(nowTime);
					mongoOps.save(user);
				}
				
				response.setSuccess(0);
			
			}
			
		} else {
			
			response.setSuccess(-2);
			
		}
		
		return response;
		
	}
	
	public void test() {
		System.out.println(mongoTemplate);
	}
	
}
