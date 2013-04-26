package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Trade;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;

public interface TradeRepository extends MongoRepository<Trade, String> {
	
	List<Trade> findByOrderId(String orderId);
	
	List<Trade> findAll();
	
	Trade save(Trade trade);
	
	void delete(Trade trade);
	
	void deleteAll();
	
	
	
}
