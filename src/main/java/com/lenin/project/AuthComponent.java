package com.lenin.project;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.User;

@Component
public class AuthComponent {

	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public AuthComponent() {
		
	}
	
	
	public RequestResponse getInitialResponse(String username, MessageContext mc, String authToken) {
		
		HttpServletRequest request = mc.getHttpServletRequest();
		
		return getInitialResponse(username, authToken, request.getRemoteAddr(), true);
	
	}
	
	public RequestResponse getInitialResponse(String username, String authToken, String remoteIp, Boolean resetSessionTime) {
		
		Long expirationTime = 900000L; // 15 minutes in ms.
		
		RequestResponse response = new RequestResponse();
		
		User user = null;
		User otherUser = null;
		List<User> usersResult = null;
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		Query query = new Query(Criteria.where("username").is(username));
		
		usersResult = mongoOps.find(query, User.class);
		
		if(usersResult.size() == 1) {
			
			user = usersResult.get(0);
			
			String otherUsername = username+" (test)";
			
			if(username.endsWith("(test)")) {
				otherUsername = username.substring(0, username.length()-7);
			}
			
			Query otherUserQuery = new Query(Criteria.where("username").is(otherUsername));
			List<User> otherUsersResult = mongoOps.find(otherUserQuery, User.class);
			otherUser = otherUsersResult.get(0);
			
			
			if(user.getAuthToken().equals(authToken) && user.getLastIp().equals(remoteIp)) {
				
				Long lastActivityTime = user.getLastActivity();
				Long nowTime = System.currentTimeMillis();
				
				Long timeSinceLastActivity = nowTime - lastActivityTime;
				
				if(timeSinceLastActivity > expirationTime) {
					
					response.setSuccess(-1);
					
				} else {
					
					if(resetSessionTime) {
						
						user.setLastActivity(nowTime);
						otherUser.setLastActivity(nowTime);
						
						mongoOps.updateFirst(new Query(Criteria.where("_id").is(new ObjectId(user.getId()))),
								new Update().set("lastActivity", nowTime), User.class);
						mongoOps.updateFirst(new Query(Criteria.where("_id").is(new ObjectId(otherUser.getId()))),
								new Update().set("lastActivity", nowTime), User.class);
						
						//mongoOps.save(user);
						//mongoOps.save(otherUser);
					
					}
					
					response.setSuccess(0);
				
				}
			
			} else {
				
				response.setSuccess(-2);
				
			}
			
			if(response.getSuccess() < 0 && user.getLoggedIn() != false) {
			
				mongoOps.updateFirst(new Query(Criteria.where("_id").is(new ObjectId(user.getId()))),
						new Update().set("loggedIn", false), User.class);
				mongoOps.updateFirst(new Query(Criteria.where("_id").is(new ObjectId(otherUser.getId()))),
						new Update().set("loggedIn", false), User.class);
			
			}
		
		} else {
			
			response.setSuccess(-3);
			
		}
		
		
		return response;
		
	}
	
	public void test() {
		System.out.println(mongoTemplate);
	}
	
}
