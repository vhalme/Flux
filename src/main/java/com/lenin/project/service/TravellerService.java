package com.lenin.project.service;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Trip;
import com.lenin.project.repositories.EntryRepository;
import com.lenin.project.repositories.PlaceRepository;
import com.lenin.project.repositories.TripRepository;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;


@Path("/")
public class TravellerService {
	
	@Autowired
	private EntryRepository entryRepository;
	
	@Autowired
	private PlaceRepository placeRepository;
	
	@Autowired
	private TripRepository tripRepository;
	
	
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
		
		Trip trip = entry.getTrip();
		Place from = entry.getFrom();
		Place to = entry.getTo();
		
		if(trip != null) {
			entry.setTrip(tripRepository.save(trip));
		}
		
		processPlace(entry, from, "from");
		processPlace(entry, to, "to");
		
		return entryRepository.save(entry);
	
	}
	
	private void processPlace(Entry entry, Place place, String direction) {
		
		if(place != null) {
		
			List<Place> matches = 
					placeRepository.findMatchingPlaces(place.getDisplayValue());
			
			Place dbPlace = null;
			
			if(matches.size() > 0) {
				dbPlace = matches.get(0);
			} else {
				dbPlace = placeRepository.save(place);
			}
			
			if(direction.equals("from")) {
				entry.setFrom(dbPlace);
			} else if(direction.equals("to")) {
				entry.setTo(dbPlace);
			}
			
		} else {
			
			// Validation exception: Missing place
			
		}
		
	}
	
	
	@GET
    @Path("/entry")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<Entry> list() {
		
		List<Entry> entries = entryRepository.findAll();
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
    @Path("/deleteall")
    @Produces({ MediaType.TEXT_PLAIN })
    public String deleteAll() {
		
		entryRepository.deleteAll();
		placeRepository.deleteAll();
		tripRepository.deleteAll();
		
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

