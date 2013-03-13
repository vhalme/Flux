package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.lenin.project.domain.Place;

public interface PlaceRepository extends MongoRepository<Place, String> {
	
	@Query(value="{ 'displayValue' : ?0 }")
	List<Place> findMatchingPlaces(String displayValue);
	
	Place findByLocationId(String locationId);
	
	List<Place> findAll();
	
	Place save(Place place);
	
	void delete(Place place);
	
	void deleteAll();
	
	
	
}
