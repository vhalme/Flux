package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Trip;

public interface TripRepository extends MongoRepository<Trip, String> {
	
	List<Trip> findAll();
	
	Trip save(Trip trip);
	
	void delete(Trip trip);
	
	void deleteAll();
	
}
