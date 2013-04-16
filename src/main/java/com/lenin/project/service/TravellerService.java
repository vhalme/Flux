package com.lenin.project.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.HttpsURLConnection;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.apache.commons.codec.binary.Hex;
import org.apache.cxf.jaxrs.utils.HttpUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.bson.types.ObjectId;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import com.lenin.project.domain.Comment;
import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Route;
import com.lenin.project.domain.Trip;
import com.lenin.project.domain.User;
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.EntryRepository;
import com.lenin.project.repositories.PlaceRepository;
import com.lenin.project.repositories.RouteRepository;
import com.lenin.project.repositories.TripRepository;
import com.lenin.project.repositories.UserRepository;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;


@Path("/")
public class TravellerService {
	
	private static long _nonce = System.currentTimeMillis() / 10000L;
	
	private static String _key = "HDF1N2X1-JOJQJ5TA-1M8PGVXA-50Y2VXQ4-6GMWYJUX";
	private static String _secret = "c26da13ab58cf0f834ed16041343c078dd36f9ba3d839b5baa79666d1be20870";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	@Autowired
	private EntryRepository entryRepository;
	
	@Autowired
	private PlaceRepository placeRepository;
	
	@Autowired
	private TripRepository tripRepository;
	
	@Autowired
	private RouteRepository routeRepository;
	
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
		
		Place from = placeRepository.findOne(fromId);
		//from.setId("jekld");
		Place to = placeRepository.findOne(toId);

		List<Route> matchingRoutes = routeRepository.findByToAndFrom(to, from);
		//List<Route> matchingRoutes = routeRepository.findByFromAndTo(from, to);
		//List<Route> matchingRoutes = routeRepository.findMatchingRoutes(from.getId(), to.getId());
		//List<Route> matchingRoutes = mongoTemplate.find(query(where("from.id").is(fromId).and("to.id").is(toId)), Route.class);
		//List<Route> matchingRoutes = mongoTemplate.find(new Query(where("from._id").is("51310c700356bd17883ef94b")), Route.class);
		
		/*
		DBCollection collection = mongoTemplate.getCollection("route");
		
		DBObject fromObj = new BasicDBObject("_id", new ObjectId("51310c700356bd17883ef94b"));
		DBObject searchById = new BasicDBObject("from", fromObj);
		DBCursor cursor = collection.find(fromObj);
		while (cursor.hasNext()) {
			
			System.out.println(cursor.next());
			
		}
		
		DBObject obj = collection.findOne();
		*/
		
		String result = "";
		
		for(Route r : matchingRoutes) {
			String s = r.getId()+"/"+r.getFrom().getDisplayValue()+"-"+r.getTo().getDisplayValue();
			System.out.println("MR: "+s);;
			
			result += s+"\r\n";
			
		}
		
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
	
	@POST
    @Path("/entry")
    @Produces({ MediaType.TEXT_PLAIN })
	@Consumes({ MediaType.TEXT_PLAIN })
    public String addEntry(String entryJson) {
        
		DBObject dbObject = (DBObject)JSON.parse(entryJson);
		System.out.println(dbObject.toString());
		
		return "OK!";
    
	}
	
	@PUT
    @Path("/entry")
    @Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
    public Entry saveEntry(Entry entry) {
		
		Route route = processRoute(entry.getRoute());
		entry.setRoute(route);
		
		Trip trip = entry.getTrip();
		if(trip != null && !trip.displayValue.equals("(none)")) {
			entry.setTrip(tripRepository.save(trip));
		}
		
		System.out.println("Saving entry...");
		return entryRepository.save(entry);
	
	}
	
	
	@PUT
    @Path("/trip")
    @Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
    public Trip saveTrip(Trip trip) {
		
		System.out.println("Saving trip...");
		return tripRepository.save(trip);
	
	}
	
	
	private Route processRoute(Route route) {
		
		Place from = processPlace(route.getFrom());
		Place to = processPlace(route.getTo());
		
		System.out.println(from.getDisplayValue()+"/"+from.getId());
		System.out.println(to.getDisplayValue()+"/"+to.getId());
		
		List<Route> matchingFromRoutes = routeRepository.findByFrom(from);
		List<Route> matchingToRoutes = routeRepository.findByTo(to);
		
		System.out.println("Matching FROM routes:"+matchingFromRoutes.size());
		System.out.println("Matching TO routes:"+matchingToRoutes.size());
		
		if(matchingFromRoutes.size() > 0 && matchingToRoutes.size() > 0) {
			
			for(Route fromRoute : matchingFromRoutes) {
				for(Route toRoute : matchingToRoutes) {
					
					System.out.println("fromRouteId: "+fromRoute.getId()+" / toRouteId: "+toRoute.getId());
					
					if(fromRoute.getId().equals(toRoute.getId())) {
						
						System.out.println("Found route: "+fromRoute.getId()+"/"+fromRoute.getFrom().getDisplayValue()+"-"+fromRoute.getTo().getDisplayValue());
						return fromRoute;
						
					}
					
				}
			}
			
		}
		
		//List<Route> matchingRoutes = mongoTemplate.find(query(where("from.displayValue").is(from.getDisplayValue()).and("to.displayValue").is(to.getDisplayValue())), Route.class);
		
		System.out.println("Saving route...");
			
		route.setFrom(from);
		route.setTo(to);
			
		return routeRepository.save(route);
		
	}
	
	private Place processPlace(Place place) {
		
		List<Place> matches = 
				placeRepository.findMatchingPlaces(place.getDisplayValue());
		
		Place dbPlace = null;
		
		if(matches.size() == 0) {
			
			System.out.println("Saving place...");
			
			String placeLat = place.getLat().toString();
			String placeLng = place.getLng().toString();
			
			placeLat = placeLat.replace(".", "P");
			placeLng = placeLng.replace(".", "P");
			
			String locationId = placeLat + "C" + placeLng;
			place.setLocationId(locationId);
			
			dbPlace = placeRepository.save(place);
		
		} else {
			dbPlace = matches.get(0);
		}
		
		return dbPlace;
		
	}
	
	@GET
    @Path("/route")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Route> listRoutes(@QueryParam("fromId") String fromId, @QueryParam("toId") String toId) {
		
		System.out.println("fromId="+fromId+"/toId="+toId);
		
		List<Route> routes = new ArrayList<Route>();
		
		Place fromPlace = null;
		Place toPlace = null;
		
		if(fromId != null) {
			fromPlace = placeRepository.findOne(fromId);
		}
		
		if(toId != null) {
			toPlace = placeRepository.findOne(toId);
		}
		
		System.out.println("fromPlace="+fromPlace+"/toPlace="+toPlace);
		
		if(fromPlace != null && toPlace == null) {
			
			routes = routeRepository.findByFrom(fromPlace);
			
		} else if(fromPlace == null && toPlace != null) {
			
			routes = routeRepository.findByTo(toPlace);
		
		} else if(fromPlace != null && toPlace != null) {
			
			routes = routeRepository.findByFromAndTo(fromPlace, toPlace);
			
		} else if(fromId == null && toId == null) {
			
			routes = routeRepository.findAll();
			
		}
		
		System.out.println(routes);
        
		return routes;
    
	}
	
	
	@GET
    @Path("/route/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Route findRoute(@PathParam("id") String id) {
		
		Route route = routeRepository.findOne(id);
		System.out.println(route);
        
		return route;
    
	}
	
	
	@GET
    @Path("/entry")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Entry> listEntries(@QueryParam("tripId") String tripId, @QueryParam("routeId") String routeId) {
		
		List<Entry> entries = new ArrayList<Entry>();
		
		if(routeId != null) {
		
			Route route = routeRepository.findOne(routeId);
			entries = entryRepository.findByRoute(route);
			
		} else if(tripId != null) {
			
			Trip trip = tripRepository.findOne(tripId);
			entries = entryRepository.findByTrip(trip);
			
		} else {
			
			entries = entryRepository.findAll();
			
		}
		
		System.out.println(entries);
        
		return entries;
    
	}
	
	
	@GET
    @Path("/entry/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Entry find(@PathParam("id") String id, 
    		@QueryParam("tripId") String tripId, @QueryParam("fromName") String fromName, @QueryParam("toName") String toName) {
		
		Entry entry = new Entry();
		
		Trip trip = new Trip();
		trip.setDisplayValue("(none)");
		entry.setTrip(trip);
		
		Route route = new Route();
		entry.setRoute(route);
		
		if(id != null && !id.equals("new")) {
			entry = entryRepository.findOne(id);
			System.out.println(entry);
			return entry;
		}
		
		if(tripId != null) {
			
			trip = tripRepository.findOne(tripId);
			entry.setTrip(trip);
		
		}
		
		if(fromName != null || toName != null) {
			
			if(fromName != null) {
				Place from = new Place();
				from.setDisplayValue(fromName);
				route.setFrom(from);
			}
			
			if(toName != null) {
				Place to = new Place();
				to.setDisplayValue(toName);
				route.setTo(to);
			}

			entry.setRoute(route);
			
		}
		
		System.out.println(entry);
        
		return entry;
    
	}
	
	
	@GET
    @Path("/place")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Place> listPlaces(@QueryParam("name") String name) {
		
		List<Place> places = new ArrayList<Place>();
		
		if(name != null) {
			
			places = placeRepository.findMatchingPlaces(name);
			
		} else {
			
			places = placeRepository.findAll();
		
		}
		
		System.out.println(places);
        
		return places;
    
	}
	
	@GET
    @Path("/trip")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Trip> listTrips() {
		
		List<Trip> trips = tripRepository.findAll();
		System.out.println(trips);
        
		return trips;
    
	}
	
	@GET
    @Path("/trip/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Trip findTrip(@PathParam("id") String id) {
		
		Trip trip = tripRepository.findOne(id);
		System.out.println(trip);
        
		return trip;
    
	}
	
	
	@GET
    @Path("/comment")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Comment> listComments(@QueryParam("parentId") String parentId) {
		
		List<Comment> comments = commentRepository.findByParentId(parentId);
		System.out.println(comments);
        
		return comments;
    
	}
	
	
	@PUT
    @Path("/comment")
    @Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
    public Comment saveComment(Comment comment) {
		
		System.out.println("Saving comment...");
		return commentRepository.save(comment);
	
	}
	
	@GET
    @Path("/deletecomments")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteComments() {
		
		commentRepository.deleteAll();
		
		return "OK";
    
	}
	
	@GET
    @Path("/deleteall")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteAll() {
		
		entryRepository.deleteAll();
		placeRepository.deleteAll();
		tripRepository.deleteAll();
		routeRepository.deleteAll();
		commentRepository.deleteAll();
		
		return "OK";
    
	}
	
	
	@GET
    @Path("/testfind")
    @Produces({ MediaType.TEXT_PLAIN })
    public String testFind() {
		
		Entry entry = entryRepository.findOne("5106c14756c866a006a3e50a");
		System.out.println(entry.getBy());
		
		return "OK";
    
	}
	
}

