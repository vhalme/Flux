package com.lenin.project.service;

import java.util.ArrayList;
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Route;
import com.lenin.project.domain.Trip;
import com.lenin.project.repositories.EntryRepository;
import com.lenin.project.repositories.PlaceRepository;
import com.lenin.project.repositories.RouteRepository;
import com.lenin.project.repositories.TripRepository;
import com.mongodb.BasicDBObject;
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
	
	public TravellerService() {
		
	}
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.TEXT_PLAIN })
    public String test() {
        return "Test OK!";
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
	
	private Route processRoute(Route route) {
		
		Place from = processPlace(route.getFrom());
		Place to = processPlace(route.getTo());
		
		System.out.println(from.getDisplayValue()+"/"+from.getId());
		System.out.println(to.getDisplayValue()+"/"+to.getId());
		
		List<Route> matchingRoutes = routeRepository.findByFromAndTo(from, to);
		
		Route dbRoute = null;
		
		if(matchingRoutes.size() == 0) {
			System.out.println("Saving route...");
			route.setFrom(from);
			route.setTo(to);
			dbRoute = routeRepository.save(route);
		} else {
			dbRoute = matchingRoutes.get(0);
		}
		
		return dbRoute;
		
	}
	
	private Place processPlace(Place place) {
		
		List<Place> matches = 
				placeRepository.findMatchingPlaces(place.getDisplayValue());
		
		Place dbPlace = null;
		
		if(matches.size() == 0) {
			System.out.println("Saving place...");
			dbPlace = placeRepository.save(place);
		} else {
			dbPlace = matches.get(0);
		}
		
		return dbPlace;
		
	}
	
	@GET
    @Path("/route")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Route> listRoutes(@QueryParam("from") String from, @QueryParam("to") String to) {
		
		List<Route> routes = new ArrayList<Route>();
		
		Place fromPlace = null;
		Place toPlace = null;
		
		if(from != null) {
			fromPlace = new Place();
			fromPlace.setId(from);
		}
		
		if(to != null) {
			toPlace = new Place();
			toPlace.setId(to);
		}
		
		if(from != null && to == null) {
			
			routes = routeRepository.findByFrom(fromPlace);
			
		} else if(from == null && to != null) {
			
			routes = routeRepository.findByTo(toPlace);
		
		} else if(from != null && to != null) {
			
			routes = routeRepository.findByFromAndTo(fromPlace, toPlace);
			
		} else {
			
			routes = routeRepository.findAll();
			
		}
		
		System.out.println(routes);
        
		return routes;
    
	}
	
	
	@GET
    @Path("/entry")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Entry> listEntries(@QueryParam("routeId") String routeId) {
		
		List<Entry> entries = new ArrayList<Entry>();
		
		Route route = routeRepository.findOne(routeId);
		
		if(route != null) {
			
			entries = entryRepository.findByRoute(route);
			
		} else {
			
			entries = entryRepository.findAll();
			
		}
		
		System.out.println(entries);
        
		return entries;
    
	}
	
	
	@GET
    @Path("/entry/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Entry find(@PathParam("id") String id) {
		
		Entry entry = entryRepository.findOne(id);
		System.out.println(entry);
        
		return entry;
    
	}
	
	
	@GET
    @Path("/place")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Place> listPlaces() {
		
		List<Place> places = placeRepository.findAll();
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

