package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.TradeRequest;
import com.lenin.project.domain.User;

public interface TransactionRepository extends MongoRepository<TradeRequest, String> {
	
	List<TradeRequest> findByUser(User user);
	
	List<TradeRequest> findByUserAndType(User user, String type);
	
	List<TradeRequest> findAll();
	
	TradeRequest save(TradeRequest tradeRequest);
	
	void delete(TradeRequest tradeRequest);
	
	void deleteAll();
	
	
	
}
