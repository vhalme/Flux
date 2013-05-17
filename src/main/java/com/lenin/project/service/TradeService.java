package com.lenin.project.service;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lenin.tradingplatform.data.entities.Trade;
import com.lenin.tradingplatform.data.repositories.TradeRepository;

@Service
@Path("/trade")
public class TradeService {

	@Autowired
	private TradeRepository tradeRepository;
	
	public TradeService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public List<Trade> getTrades(@HeaderParam("User-Id") String userId,
			@QueryParam("orderId") String orderId) {

		if (orderId != null) {
			return tradeRepository.findByOrderId(orderId);
		} else {
			return tradeRepository.findAll();
		}

	}

	
	@GET
	@Path("/del")
	@Produces({ MediaType.TEXT_PLAIN })
	public String delTrades(@HeaderParam("User-Id") String userId,
			@QueryParam("orderId") String orderId) {
		
		tradeRepository.deleteAll();

		return "OK";

	}
	

}
