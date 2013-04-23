package com.lenin.project.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.apache.commons.codec.binary.Hex;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.lenin.project.domain.RateQuote;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.TransactionRepository;
import com.lenin.project.repositories.UserRepository;


@Path("/")
public class TravellerService {
	
	private static long _nonce = System.currentTimeMillis() / 10000L;
	
	private static String _key = "XSR43QT2-B7PBL6EY-U6JCVFCM-7IMTI26B-7XEL3DGO";
	private static String _secret = "a93adec600bd65960d26d779343b70700fbb4a93e333e15350b2bb1a21fb46de";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private TransactionRepository transactionRepository;
	
	
	public TravellerService() {
		
	}
	
	@GET
	@Path("/rates")
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse getRates(@HeaderParam("User-Id") String userId) {
		
		User user = userRepository.findByUsername(userId);
		
		RequestResponse response = new RequestResponse();
		
		if(user.getLive()) {
		
			try {
	    	
				//Create connection
				HttpClient client = new DefaultHttpClient();
				HttpGet get = new HttpGet("https://btc-e.com/api/2/ltc_usd/ticker");
	    	
				HttpResponse httpResponse = client.execute(get);
				HttpEntity entity = httpResponse.getEntity();
				
				if(entity != null) {
	    	    
					InputStream instream = entity.getContent();
	    	       
					BufferedReader in = 
						new BufferedReader(new InputStreamReader(instream));
	    	        
					String resultStr = "";
					String inputLine = null;
						
					while((inputLine = in.readLine()) != null) {
						//System.out.println(inputLine);
						resultStr += inputLine;
					}
	    	        
					in.close();
	    	    	instream.close();
	    	    	
	    	    	JSONObject jsonResult = new JSONObject(resultStr);
	    	    	JSONObject ticker = jsonResult.getJSONObject("ticker");
	    	    	
	    	    	RateQuote rateQuote = new RateQuote();
	    	    	rateQuote.setDate(new Date());
	    	    	rateQuote.setPair("ltc_usd");
	    	    	rateQuote.setLast(ticker.getDouble("last"));
	    	    	rateQuote.setBuy(ticker.getDouble("buy"));
	    	    	rateQuote.setSell(ticker.getDouble("sell"));
	    	    	
	    	    	response.setSuccess(1);
	    	    	response.setData(rateQuote);
	    	    	
				}
	    	
	    	} catch (Exception e) {

	    		e.printStackTrace();
	  	      	return null;

	  	    }

	    	
		} else {
			
			RateQuote rateQuote = new RateQuote();
	    	rateQuote.setDate(new Date());
	    	rateQuote.setPair("ltc_usd");
	    	rateQuote.setLast(2.1);
	    	rateQuote.setBuy(2.1);
	    	rateQuote.setSell(2.1);
	    	
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
		
		User user = userRepository.findByUsername(userId);
		
		RequestResponse response = new RequestResponse();
		
		if(user.getLive()) {
			
			List<NameValuePair> methodParams = new ArrayList<NameValuePair>();
			methodParams.add(new BasicNameValuePair("method", "getInfo"));
			JSONObject userInfoResult = authenticatedHTTPRequest(methodParams);
			
			try {
				
				Integer success = userInfoResult.getInt("success");
				response.setSuccess(success);
				
				if(success == 1) {
					
					JSONObject funds = 
							userInfoResult
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
		
		User user = userRepository.findByUsername(userId);
		
		transactionRepository.delete(transaction);
		
		RequestResponse response = new RequestResponse();
		response.setSuccess(1);
		
		List<Transaction> transactions = getTransactions(userId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	@POST
	@Path("/transaction")
	@Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    public RequestResponse postTransaction(@HeaderParam("User-Id") String userId, Transaction transaction) {
		
		User user = userRepository.findByUsername(userId);
		transaction.setUser(user);
		
		RequestResponse response = new RequestResponse();
		
		if(user.getLive()) {
			
			List<NameValuePair> methodParams = new ArrayList<NameValuePair>();
			methodParams.add(new BasicNameValuePair("method", "Trade"));
			methodParams.add(new BasicNameValuePair("type", transaction.getType()));
			methodParams.add(new BasicNameValuePair("pair", transaction.getPair()));
			methodParams.add(new BasicNameValuePair("amount", ""+transaction.getAmount()));
			methodParams.add(new BasicNameValuePair("rate", ""+transaction.getRate()));
			
			JSONObject tradeResult = authenticatedHTTPRequest(methodParams);
			
			try {
				
				Integer success = tradeResult.getInt("success");
				response.setSuccess(success);
				
				if(success == 1) {
					
					executeTransaction(user, transaction);
					
				}
				
			} catch(JSONException e) {
				
				e.printStackTrace();
				
				response.setSuccess(-1);
				response.setMessage(e.getMessage());
				
			}
			
		} else {
			
			executeTransaction(user, transaction);
			
			response.setSuccess(1);
			
		}
		
		List<Transaction> transactions = getTransactions(userId, null);
		response.setData(transactions);
		
		return response;
		
	}
	
	
	private void executeTransaction(User user, Transaction transaction) {
		
		Double usdVal = transaction.getAmount() * transaction.getRate();
		
		if(transaction.getType().equals("buy")) {
			
			user.setUsd(user.getUsd() - usdVal);
			user.setLtc(user.getLtc() + transaction.getAmount());
			
		} else if(transaction.getType().equals("sell")) {
			
			user.setUsd(user.getUsd() + usdVal);
			user.setLtc(user.getLtc() - transaction.getAmount());
			
		}
		
		Transaction reverseTransaction = transaction.getReverseTransaction();
		
		if(reverseTransaction != null) {
			
			Double transactionRevenue = 0.0;
			
			if(transaction.getType().equals("sell")) {
				
				transactionRevenue = 
					(transaction.getAmount()*transaction.getRate()) - 
					(reverseTransaction.getAmount()*reverseTransaction.getRate());
			
			} else if(transaction.getType().equals("buy")) {
				
				transactionRevenue = 
						(reverseTransaction.getAmount()*reverseTransaction.getRate()) -
						(transaction.getAmount()*transaction.getRate());
			
			}
				
			user.setProfitUsd(user.getProfitUsd() + transactionRevenue);
			
			transactionRepository.delete(reverseTransaction);
			
		}
		
		userRepository.save(user);
		
		if(transaction.getSave()) {
			transactionRepository.save(transaction);
		}
		
	}
	
	
	private JSONObject authenticatedHTTPRequest(List<NameValuePair> methodParams) {
        
		// Request parameters and other properties.
        List<NameValuePair> params = new ArrayList<NameValuePair>(2);
        params.add(new BasicNameValuePair("nonce", "" + ++_nonce));
        
        String paramsString = "nonce="+_nonce;
    	
        if(methodParams != null) {
        	for(NameValuePair nvp : methodParams) {
        		params.add(nvp);
        		paramsString += "&"+nvp.getName()+"="+nvp.getValue();
        	}
        }
        
        System.out.println(paramsString);
        
        HttpClient httpclient = new DefaultHttpClient();
        HttpPost httppost = new HttpPost("https://btc-e.com/tapi");
        
        try {
        	
        	UrlEncodedFormEntity uefe = new UrlEncodedFormEntity(params, "UTF-8");
            httppost.setEntity(uefe);
            
    		SecretKeySpec key = new SecretKeySpec(_secret.getBytes("UTF-8"), "HmacSHA512");
    		Mac mac = Mac.getInstance("HmacSHA512" );
        	mac.init(key);
        	
        	String sign = Hex.encodeHexString(mac.doFinal(paramsString.getBytes("UTF-8")));
        	httppost.addHeader("Key", _key);
        	httppost.addHeader("Sign", sign);
        	
        } catch(Exception e) {
        	e.printStackTrace();
        }
        
        String result = "";
        
        try {
        
        	//Execute and get the response.
        	HttpResponse response = httpclient.execute(httppost);
        	HttpEntity entity = response.getEntity();

        	if(entity != null) {
        	
        		InputStream instream = entity.getContent();
        		
        		BufferedReader rd = new BufferedReader(new InputStreamReader(instream));
        		System.out.println("Ready to read result...");
        	
        		String line = null;
        		while((line = rd.readLine()) != null) {
            		result += line;
            	}
            	
        	}
            
        } catch(Exception e) {
    		
        	e.printStackTrace();
        	return null;
        			
        }
        
        try {
        
        	JSONObject jsonResult = new JSONObject(result);
        	
        	int success = jsonResult.getInt("success");
        	
        	System.out.println(result);
        	
        	return jsonResult;
        	
        } catch(JSONException e) {
        	
        	e.printStackTrace();
        	return null;
        	
        }
        
        
        
    }
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.TEXT_PLAIN })
    public String test(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		//System.out.println(fromId);
		//System.out.println(toId);
		
		String result = "test";
		
		
		User testUser = new User();
		testUser.setUsername("testUser456");
		testUser.setLive(true);
		
		userRepository.save(testUser);
		
        return result;
    
	}
	
	@GET
    @Path("/init")
    @Produces({ MediaType.TEXT_PLAIN })
    public String initUsers(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		//System.out.println(fromId);
		//System.out.println(toId);
		
		String result = "test";
		
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
	
	
	@GET
    @Path("/deleteall")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteAll() {
		
		userRepository.deleteAll();
		commentRepository.deleteAll();
		
		return "OK";
    
	}
	
	
}

