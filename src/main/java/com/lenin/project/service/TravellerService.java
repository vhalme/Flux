package com.lenin.project.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.bson.types.ObjectId;
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
import com.lenin.project.repositories.CommentRepository;
import com.lenin.project.repositories.EntryRepository;
import com.lenin.project.repositories.PlaceRepository;
import com.lenin.project.repositories.RouteRepository;
import com.lenin.project.repositories.TripRepository;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;


@Path("/")
public class TravellerService {
	
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
	
	public TravellerService() {
		
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
		
		if(matchingFromRoutes.size() > 0 && matchingToRoutes.size() > 0) {
			
			for(Route fromRoute : matchingFromRoutes) {
				for(Route toRoute : matchingToRoutes) {
					
					if(fromRoute.getId() == toRoute.getId()) {
						
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
		
		List<Route> routes = new ArrayList<Route>();
		
		Place fromPlace = null;
		Place toPlace = null;
		
		if(fromId != null) {
			fromPlace = placeRepository.findOne(fromId);
		}
		
		if(toId != null) {
			toPlace = placeRepository.findOne(toId);
		}
		
		if(fromId != null && toId == null) {
			
			routes = routeRepository.findByFrom(fromPlace);
			
		} else if(fromId == null && toId != null) {
			
			routes = routeRepository.findByTo(toPlace);
		
		} else if(fromId != null && toId != null) {
			
			routes = routeRepository.findByFromAndTo(fromPlace, toPlace);
			
		} else {
			
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

