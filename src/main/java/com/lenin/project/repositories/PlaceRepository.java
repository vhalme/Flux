package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.StubData;
import com.lenin.project.domain.Trip;

public interface PlaceRepository extends MongoRepository<Place, String> {
	
	@Query(value="{ 'displayValue' : ?0 }")
	List<Place> findMatchingPlaces(String displayValue);
	
	List<Place> findAll();
	
	Place save(Place place);
	
	void delete(Place place);
	
	void deleteAll();
	
	
	
}
