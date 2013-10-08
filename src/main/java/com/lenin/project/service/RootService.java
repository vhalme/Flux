package com.lenin.project.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.project.util.PasswordHash;
import com.lenin.tradingplatform.client.BitcoinApi;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AccountFunds;
import com.lenin.tradingplatform.data.entities.AutoTradingOptions;
import com.lenin.tradingplatform.data.entities.FundTransaction;
import com.lenin.tradingplatform.data.entities.PropertyMap;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.Settings;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.OrderRepository;
import com.lenin.tradingplatform.data.repositories.TradeRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;
import com.octo.captcha.module.servlet.image.SimpleImageCaptchaServlet;

@Service
@Path("/")
public class RootService {
	
	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private TradeRepository tradeRepository;

	@Autowired
	private TradingSessionRepository tradingSessionRepository;

	@Autowired
	private AuthComponent authComponent;
	
	
	public RootService() {
	}

	
	@POST
	@Path("/btcrpc")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse btcApiCall(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("method") String method, List<Object> params) {

		System.out.println(method + ": " + params + "/" + params.size());

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		User user = userRepository.findByUsername(username);

		List<String> clientParams = new ArrayList<String>();

		BitcoinApi api = new BitcoinApi("127.0.0.1", 8332, "fluxltc1", "fLuxThuyu1eP");
		
		if (method.equals("sendfrom")) {
			
			AccountFunds accountFunds = user.getAccountFunds();
			Map<String, Double> reserves = accountFunds.getReserves();
			Double availableAmount = reserves.get(params.get(0));

			String currency = (String)params.get(0);
			String toAddress = (String)params.get(1);
			Double amount = Double.parseDouble((String)params.get(2));
			
			if (availableAmount >= amount) {

				String fromAccount = accountFunds.getAccountName();

				clientParams.add(fromAccount);
				clientParams.add(toAddress);
				clientParams.add("" + amount);

				JSONObject result = api.exec(method, params);

				try {
					System.out.println(result.get("result"));
				} catch (Exception e) {
					e.printStackTrace();
				}

			}

		}


		response.setData(user);
		response.setSuccess(1);

		return response;

	}

	
	@POST
	@Path("/login")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse login(@HeaderParam("Username") String username, 
			@HeaderParam("Email") String email, 
			@QueryParam("reg") String reg,
			@QueryParam("captcha") String captcha,
			String password) {
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		RequestResponse response = new RequestResponse();

		User user = userRepository.findByUsername(username);
		
		Long nowTime = System.currentTimeMillis();
		
		HttpServletRequest request = mc.getHttpServletRequest();
		String remoteIp = request.getRemoteAddr();
		
		if(user != null) {
			
			Boolean pwdOk = false;
			
			if(reg != null) {
				response.setSuccess(-3);
				response.setMessage("Username already exists.");
				return response;
			}
			
			try {
			
				pwdOk = PasswordHash.validatePassword(password, user.getPassword());
				
			} catch(Exception e) {
				e.printStackTrace();
			}
			
			if(pwdOk == true && user.getDeleted() == false) {
				
				User testUser = userRepository.findByUsername(email + " (test)");
				
				String token = "" + Math.random();

				user.setAuthToken(token);
				user.setLastActivity(nowTime);
				user.setLastIp(remoteIp);
				
				testUser.setAuthToken(token);
				testUser.setLastActivity(nowTime);
				testUser.setLastIp(remoteIp);
				
				userRepository.save(user);
				userRepository.save(testUser);

				System.out.println("Logging in user " + email);
				response.setSuccess(1);

			} else {
				
				System.out.println("Incorrect password " + password+"/"+user.getPassword());
				response.setMessage("Wrong username or password.");
				response.setSuccess(0);
				
			}
			
		} else {
			
			if(reg == null) {
				response.setSuccess(2);
				return response;
			}
			
			String captchaResult = checkCaptcha(captcha);
			if(!captchaResult.equals("P")) {
				response.setSuccess(-2);
				return response;
			}
			
			System.out.println("Creating user " + email);
			
			Query searchRates = new Query(Criteria.where("setType").is("15s")).with(new Sort(Direction.DESC, "time")).limit(10);
			List<Rate> rates = mongoOps.find(searchRates, Rate.class);
			
			HashMap<String, Rate> rateMap = new HashMap<String, Rate>();
			for(Rate rate : rates) {
				rateMap.put(rate.getPair(), rate);
				System.out.println("Last rate: "+rate.getPair()+"="+rate.getLast()+", "+rate.getMovingAverages().size());
				if(rateMap.get("ltc_usd") != null && rateMap.get("ltc_btc") != null && rateMap.get("btc_usd") != null) {
					break;
				}
			}
			
			
			String pwdHash = "";
			
			try {
				
				pwdHash = PasswordHash.createHash(password);
				
			} catch(Exception e) {
				e.printStackTrace();
				response.setSuccess(-1);
				return response;
			}
			
			user = new User();
			user.setUsername(email);
			user.setEmail(email);
			user.setPassword(pwdHash);
			
			user.setLive(true);
			user.setLastActivity(nowTime);
			user.setLastIp(remoteIp);
			
			System.out.println("userId="+user.getId());
			
			AccountFunds accountFunds = new AccountFunds();
			
			PropertyMap testServiceInfo = new PropertyMap();
			testServiceInfo.setName("Test");
			Map<String, Object> testServiceStrings = new HashMap<String, Object>();
			testServiceStrings.put("apiKey", "ok");
			testServiceStrings.put("apiSecret", "ok");
			testServiceInfo.setProperties(testServiceStrings);
			
			PropertyMap btceServiceInfo = new PropertyMap();
			btceServiceInfo.setName("BTC-E");
			Map<String, Object> btceServiceStrings = new HashMap<String, Object>();
			btceServiceStrings.put("apiKey", "");
			btceServiceStrings.put("apiSecret", "");
			btceServiceInfo.setProperties(btceServiceStrings);
			//Map<String, Double> btceServiceDoubles = new HashMap<String, Double>();
			//btceServiceDoubles.put("usd", 0.0);
			//btceServiceDoubles.put("btc", 0.0);
			//btceServiceDoubles.put("ltc", 0.0);
			//btceServiceInfo.setDoubleProperties(btceServiceDoubles);
			
			PropertyMap mtgoxServiceInfo = new PropertyMap();
			mtgoxServiceInfo.setName("Mt. Gox");
			Map<String, Object> mtgoxServiceStrings = new HashMap<String, Object>();
			mtgoxServiceStrings.put("apiKey", "");
			mtgoxServiceStrings.put("apiSecret", "");
			mtgoxServiceInfo.setProperties(mtgoxServiceStrings);
			//Map<String, Double> mtgoxServiceDoubles = new HashMap<String, Double>();
			//mtgoxServiceDoubles.put("usd", 0.0);
			//mtgoxServiceDoubles.put("btc", 0.0);
			//mtgoxServiceInfo.setDoubleProperties(mtgoxServiceDoubles);
			
			Date dateStart = new Date();
			Calendar calEnd = Calendar.getInstance(); 
			calEnd.add(Calendar.MONTH, 1);
			Date dateEnd = calEnd.getTime();
			calEnd.add(Calendar.MONTH, 1);
			Date nextDateEnd = calEnd.getTime();
			
			PropertyMap paymentMethodInfo = new PropertyMap();
			paymentMethodInfo.setName("Payment method");
			Map<String, Object> paymentMethodStrings = new HashMap<String, Object>();
			List<Map<String, Object>> periods = new ArrayList<Map<String, Object>>();
			Map<String, Object> lastPeriod = null;
			Map<String, Object> currentPeriod = new HashMap<String, Object>();
			currentPeriod.put("currency", "");
			currentPeriod.put("method", "");
			currentPeriod.put("start", dateStart);
			currentPeriod.put("end", dateEnd);
			Map<String, String> sharedProfit = new HashMap<String, String>();
			sharedProfit.put("btc", "0.0");
			sharedProfit.put("ltc", "0.0");
			sharedProfit.put("usd", "0.0");
			currentPeriod.put("sharedProfit", sharedProfit);
			Map<String, Object> nextPeriod = new HashMap<String, Object>();
			nextPeriod.put("currency", "");
			nextPeriod.put("method", "");
			nextPeriod.put("start", dateEnd);
			nextPeriod.put("end", nextDateEnd);
			Map<String, String> nextSharedProfit = new HashMap<String, String>();
			nextSharedProfit.put("btc", "0.0");
			nextSharedProfit.put("ltc", "0.0");
			nextSharedProfit.put("usd", "0.0");
			nextPeriod.put("sharedProfit", nextSharedProfit);
			periods.add(0, lastPeriod);
			periods.add(0, currentPeriod);
			periods.add(0, nextPeriod);
			
			paymentMethodStrings.put("periods", periods);
			paymentMethodInfo.setProperties(paymentMethodStrings);
			
			Map<String, PropertyMap> serviceInfos = new HashMap<String, PropertyMap>();
			serviceInfos.put("test", testServiceInfo);
			serviceInfos.put("btce", btceServiceInfo);
			serviceInfos.put("mtgox", mtgoxServiceInfo);
			serviceInfos.put("payment", paymentMethodInfo);
			
			accountFunds.setServiceProperties(serviceInfos);
			
			Map<String, Double> reserves = new HashMap<String, Double>();
			reserves.put("usd", 0.0);
			reserves.put("ltc", 0.0);
			reserves.put("btc", 0.0);
			accountFunds.setReserves(reserves);
			
			Map<String, Map<String, Double>> activeFunds = new HashMap<String, Map<String, Double>>();
			Map<String, Double> activeMtgoxFunds = new HashMap<String, Double>();
			activeMtgoxFunds.put("usd", 0.0);
			activeMtgoxFunds.put("ltc", 0.0);
			activeMtgoxFunds.put("btc", 0.0);
			activeFunds.put("mtgox", activeMtgoxFunds);
			Map<String, Double> activeBtceFunds = new HashMap<String, Double>();
			activeBtceFunds.put("usd", 0.0);
			activeBtceFunds.put("ltc", 0.0);
			activeBtceFunds.put("btc", 0.0);
			activeFunds.put("btce", activeBtceFunds);
			Map<String, Double> activeTestFunds = new HashMap<String, Double>();
			activeTestFunds.put("usd", 0.0);
			activeTestFunds.put("ltc", 0.0);
			activeTestFunds.put("btc", 0.0);
			activeFunds.put("test", activeTestFunds);
			accountFunds.setActiveFunds(activeFunds);
			
			user.setAccountFunds(accountFunds);
			
			Integer btcResult = createAddress("btc", accountFunds);
			Integer ltcResult = createAddress("ltc", accountFunds);
			
			if(btcResult != 1 || ltcResult != 1) {
				
				response.setSuccess(-1);
				
				String message = "";
				
				if(btcResult != 1) {
					message += "(1) Failed to create a BTC wallet. ";
				}
				
				if(ltcResult != 1) {
					message += "(2) Failed to create an LTC wallet.";
				}
				
				response.setMessage(message);
				return response;
				
			}
			
			
			Rate ltc_usd = rateMap.get("ltc_usd");
			AutoTradingOptions autoTradingOptions = new AutoTradingOptions();
			autoTradingOptions.setBuyChunk(10.0);
			autoTradingOptions.setSellChunk(10.0);
			autoTradingOptions.setBuyThreshold(5.0);
			autoTradingOptions.setSellThreshold(5.0);
			autoTradingOptions.setBuyCeiling(ltc_usd.getLast());
			autoTradingOptions.setSellFloor(ltc_usd.getLast());
			TradingSession tradingSession = new TradingSession();
			//tradingSession.setUser(user);
			tradingSession.setCurrencyLeft("usd");
			tradingSession.setCurrencyRight("ltc");
			tradingSession.setService("btce");
			tradingSession.setLive(true);
			tradingSession.setProfitLeft(0.0);
			tradingSession.setProfitLeftSince(new Date());
			tradingSession.setProfitRight(0.0);
			tradingSession.setProfitRightSince(new Date());
			tradingSession.setAutoTradingOptions(autoTradingOptions);
			tradingSession.setRate(ltc_usd);
			
			User testUser = new User();
			testUser.setLastActivity(nowTime);
			testUser.setLastIp(remoteIp);
			testUser.setUsername(email + " (test)");
			testUser.setEmail(email);
			testUser.setLive(false);
			
			System.out.println("testUserId="+testUser.getId());
			
			testUser.setAccountFunds(accountFunds);
			
			AutoTradingOptions testAutoTradingOptions = new AutoTradingOptions();
			testAutoTradingOptions.setBuyChunk(10.0);
			testAutoTradingOptions.setSellChunk(10.0);
			testAutoTradingOptions.setBuyThreshold(5.0);
			testAutoTradingOptions.setSellThreshold(5.0);
			testAutoTradingOptions.setBuyCeiling(ltc_usd.getLast());
			testAutoTradingOptions.setSellFloor(ltc_usd.getLast());
			TradingSession testTradingSession = new TradingSession();
			//testTradingSession.setUser(testUser);
			testTradingSession.setCurrencyLeft("usd");
			testTradingSession.setCurrencyRight("ltc");
			testTradingSession.setService("test");
			testTradingSession.setLive(false);
			testTradingSession.setAutoTradingOptions(testAutoTradingOptions);
			testTradingSession.setRate(ltc_usd);

			String token = "" + Math.random();

			user.setAuthToken(token);
			testUser.setAuthToken(token);
			
			mongoOps.save(accountFunds);
			
			userRepository.save(user);
			tradingSession.setUserId(user.getId());
			tradingSession.setUsername(user.getUsername());
			tradingSessionRepository.save(tradingSession);
			user.addTradingSession(tradingSession);
			user.setCurrentTradingSession(tradingSession);
			userRepository.save(user);
			
			userRepository.save(testUser);
			testTradingSession.setUserId(testUser.getId());
			testTradingSession.setUsername(testUser.getUsername());
			tradingSessionRepository.save(testTradingSession);
			testUser.addTradingSession(testTradingSession);
			testUser.setCurrentTradingSession(testTradingSession);
			userRepository.save(testUser);
			
			response.setSuccess(3);

		}

		response.setData(user);
		
		return response;

	}

	private Integer createAddress(String currency, AccountFunds accountFunds) {
		
		Integer result = 1;
		
		String ip = null;
		int port = 0;
		
		if(currency.equals("btc")) {
			ip = "162.243.18.105";
			port = 9332;
		} else if(currency.equals("ltc")) {
			ip = "192.241.166.79";
			port = 9332;
		}
		
		if(port == 0) {
			return 0;
		}
		
		String accountName = accountFunds.getAccountName();
		if (accountName == null) {
			accountName = randomString();
			accountFunds.setAccountName(accountName);
		}

		Map<String, String> addresses = accountFunds.getAddresses();
		if (addresses == null) {
			addresses = new HashMap<String, String>();
		}
		
		BitcoinApi api = new BitcoinApi(ip, port,  "fluxltc1", "fLuxThuyu1eP");
		
		List<Object> params = new ArrayList<Object>();
		params.add(accountName);
		
		try {

			JSONObject addrResult = api.exec("getnewaddress", params);
			
			if(addrResult == null) {
				return 0;
			}
			
			String addrStr = addrResult.getString("result");
			System.out.println("New address/account: " + addrStr + "/"
					+ accountName);

			addresses.put(currency, addrStr);
			accountFunds.setAddresses(addresses);
			
			return 1;
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return 0;

	}

	private String randomString() {

		String[] chars = new String[] { "A", "B", "C", "D", "E", "F", "G", "H",
				"I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U",
				"V", "X", "Z" };

		String str = "";

		for (int i = 0; i < 5; i++) {
			int charIndex = (int) Math.round(Math.random() * 22);
			str += chars[charIndex];
		}

		str += System.currentTimeMillis();

		return str;

	}
	
	
	@GET
	@Path("/deleteall")
	@Produces({ MediaType.TEXT_PLAIN })
	public String deleteAll() {

		// tickerRepository.deleteAll();
		mongoTemplate.dropCollection(Settings.class);
		mongoTemplate.dropCollection(FundTransaction.class);
		tradingSessionRepository.deleteAll();
		tradeRepository.deleteAll();
		orderRepository.deleteAll();
		userRepository.deleteAll();
		
		return "OK";

	}
	
	
	@GET
	@Path("/test")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse test(@QueryParam("fromId") String tradingSessionId) {

		RequestResponse response = new RequestResponse();

		String accountName = randomString();
		
		BitcoinApi api = new BitcoinApi("127.0.0.1", 8332,  "fluxltc1", "fLuxThuyu1eP");
		
		List<Object> params = new ArrayList<Object>();
		params.add(accountName);
		
		JSONObject result = api.exec("getnewaddress", params);
		
		try {
			System.out.println(result.get("result"));
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		response.setData(result.toString());
		
		return response;

	}
	
	
	@GET
	@Path("/verifyemail")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse verifyEmail(@QueryParam("token") String userId) {
		
		RequestResponse response = new RequestResponse();
		response.setSuccess(0);
		
		User user = userRepository.findOne(userId);
		
		if(user != null) {
			
			response.setSuccess(1);
			
			if(user.getEmailVerified() == false) {
				user.setEmailVerified(true);
				userRepository.save(user);
			} else {
				response.setSuccess(2);
			}
			
		}
		
		return response;
		
	}
	
	
	
	@GET
	@Path("/checkcaptcha")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.TEXT_PLAIN })
	public String checkCaptcha(@QueryParam("captcha") String captcha) {
		
		HttpServletRequest request = mc.getHttpServletRequest();
		System.out.println("check captcha: "+captcha);
		
		if(SimpleImageCaptchaServlet.validateResponse(request, captcha)) {
			return "P";
		} else {
			return "F";
		}
	
	}
	
	/*
	@GET
	@Path("/info")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getAccountInfo(@HeaderParam("User-Id") String userId) {

		RequestResponse response = new RequestResponse();
		User user = userRepository.findByUsername(userId);

		JSONObject accountInfoResult = BtceApi.getAccountInfo();

		if (accountInfoResult == null) {
			response.setSuccess(0);
			response.setMessage("Could not get account info.");
			return response;
		}

		try {

			Integer success = accountInfoResult.getInt("success");
			response.setSuccess(success);

			if (success == 1) {

				JSONObject funds = accountInfoResult.getJSONObject("return")
						.getJSONObject("funds");

			}

		} catch (JSONException e) {

			e.printStackTrace();

			response.setSuccess(-1);
			response.setMessage(e.getMessage());

		}
		
		response.setData(user);

		return response;

	}
	*/

}
