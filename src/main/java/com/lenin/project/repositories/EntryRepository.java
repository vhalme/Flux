package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Route;
import com.lenin.project.domain.Trip;

public interface EntryRepository extends MongoRepository<Entry, String> {
	
	List<Entry> findByTrip(Trip trip);
	
	List<Entry> findByRoute(Route route);
	
	List<Entry> findAll();
	
	Entry save(Entry entry);
	
	void delete(Entry entry);
	
	void deleteAll();
	
	
}
