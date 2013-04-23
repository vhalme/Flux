package com.lenin.project.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.lenin.project.domain.User;
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.UserRepository;


@Path("/")
public class TravellerService {
	
	private static long _nonce = System.currentTimeMillis() / 10000L;
	
	private static String _key = "HDF1N2X1-JOJQJ5TA-1M8PGVXA-50Y2VXQ4-6GMWYJUX";
	private static String _secret = "c26da13ab58cf0f834ed16041343c078dd36f9ba3d839b5baa79666d1be20870";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public TravellerService() {
		
	}
	
	@GET
	@Path("/rates")
    @Produces({ MediaType.TEXT_PLAIN })
    public String getRates() {
		
		String result = "";
		
	    try {
	    	
	    	//Create connection
	    	HttpClient client = new DefaultHttpClient();
	    	HttpGet get = new HttpGet("https://btc-e.com/api/2/ltc_usd/ticker");
	    	
	    	HttpResponse response = client.execute(get);
	    	HttpEntity entity = response.getEntity();
	    	
	    	if (entity != null) {
	    	    
	    		InputStream instream = entity.getContent();
	    	    
	    	    try {
	    	        
	    	    	BufferedReader in = 
	    	        		new BufferedReader(new InputStreamReader(instream));
	    	        
	    	        String inputLine;
	    	        
	    	        while ((inputLine = in.readLine()) != null) {
	    	            //System.out.println(inputLine);
	    	            result += inputLine;
	    	        }
	    	        
	    	        in.close();
	    	    
	    	    } finally {
	    	        
	    	    	instream.close();
	    	    
	    	    }
	    	
	    	}
	    	
	    	

	    } catch (Exception e) {

	      e.printStackTrace();
	      return null;

	    }
	    
		return result;
		
	}
	
	@GET
	@Path("/info")
    @Produces({ MediaType.TEXT_PLAIN })
    public String getInfo() {
		
		return authenticatedHTTPRequest("getInfo", null);
		
	}
	
	@POST
	@Path("/trade")
	@Consumes({ MediaType.TEXT_PLAIN })
    @Produces({ MediaType.TEXT_PLAIN })
    public String trade(String query) {
		
		String[] params = query.split("&");
		List<NameValuePair> methodParams = new ArrayList<NameValuePair>();
		
		for(String param : params) {
			String[] name_value = param.split("=");
			methodParams.add(new BasicNameValuePair(name_value[0], name_value[1]));
		}
		
		return authenticatedHTTPRequest("getInfo", methodParams);
		
	}
	
	
	private String authenticatedHTTPRequest(String method, List<NameValuePair> methodParams) {
        
		// Request parameters and other properties.
        List<NameValuePair> params = new ArrayList<NameValuePair>(2);
        params.add(new BasicNameValuePair("method", method));
        params.add(new BasicNameValuePair("nonce", "" + ++_nonce));
        
        String paramsString = "method="+method+"&nonce="+_nonce;
    	
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
    	}
        
        System.out.println(result);
        return result;
        
        
    }
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.TEXT_PLAIN })
    public String test(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		//System.out.println(fromId);
		//System.out.println(toId);
		
		String result = "test";
		
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

