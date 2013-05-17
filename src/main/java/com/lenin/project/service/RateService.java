package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.repositories.RateRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;

@Service
@Path("/rate")
public class RateService {


	@Autowired
	private TradingSessionRepository tradingSessionRepository;

	@Autowired
	private RateRepository rateRepository;


	public RateService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getRates(@QueryParam("pair") String pair,
			@QueryParam("setType") String setType,
			@QueryParam("from") Long from, @QueryParam("until") Long until) {

		// System.out.println(pair+"/"+setType+"/"+from+"/"+until);

		RequestResponse response = new RequestResponse();

		List<Rate> rates = new ArrayList<Rate>();

		if (pair != null && setType != null && from != null && until != null) {
			rates = rateRepository
					.findByPairAndSetTypeAndTimeBetweenOrderByTimeAsc(pair,
							setType, from, until);
		} else if (pair != null && from != null && until != null) {
			rates = rateRepository.findByPairAndTimeBetweenOrderByTimeAsc(
					pair, from, until);
		} else if (pair != null && from != null) {
			rates = rateRepository
					.findByPairAndTimeGreaterThanOrderByTimeAsc(pair, from);
		} else if (pair != null && until != null) {
			rates = rateRepository.findByPairAndTimeLessThanOrderByTimeAsc(
					pair, until);
		} else {
			rates = rateRepository.findAll();
		}
		
		response.setSuccess(1);
		response.setData(rates);

		return response;

	}

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse setRate(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId, Rate rate) {

		RequestResponse response = new RequestResponse();

		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);

		if (tradingSession.getLive() == false) {

			rate.setTime(System.currentTimeMillis() / 1000L);
			tradingSession.setRate(rate);
			tradingSessionRepository.save(tradingSession);

			response.setSuccess(1);
			response.setData(rate);

		} else {
			response.setSuccess(0);
		}

		return response;

	}


}
