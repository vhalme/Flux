package com.lenin.project.service;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.Trade;
import com.lenin.tradingplatform.data.repositories.TradeRepository;

@Service
@Path("/trade")
public class TradeService {

	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private TradeRepository tradeRepository;
	
	@Autowired
	private AuthComponent authComponent;
	
	public TradeService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getTrades(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("orderId") String orderId) {
		
		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		if (orderId != null) {
			
			List<Trade> trades =  tradeRepository.findByOrderId(orderId);
			response.setData(trades);
			response.setSuccess(1);
			
		} else {
			
			List<Trade> trades = tradeRepository.findAll();
			response.setData(trades);
			response.setSuccess(1);
			
		}
		
		return response;

	}

	
	@GET
	@Path("/del")
	@Produces({ MediaType.TEXT_PLAIN })
	public String delTrades(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("orderId") String orderId) {
		
		tradeRepository.deleteAll();

		return "OK";

	}
	

}
