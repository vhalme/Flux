package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Route;

public interface RouteRepository extends MongoRepository<Route, String> {
	
	List<Route> findByFrom(Place from);
	
	List<Route> findByTo(Place to);
	
	List<Route> findByFromAndTo(Place from, Place to);
	
	List<Route> findAll();
	
	Route save(Route route);
	
	void delete(Route route);
	
	void deleteAll();
	
	
	
}
