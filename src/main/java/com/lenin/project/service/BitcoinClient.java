package com.lenin.project.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.HTTP;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class BitcoinClient {

	private String host;
	private int port;
	
	
	public BitcoinClient(String host, int port) {
		this.host = host;
		this.port = port;
	}

	public JSONObject exec(String method, List<String> params) {

		
		DefaultHttpClient httpclient = new DefaultHttpClient();
		httpclient.getCredentialsProvider().setCredentials(
				new AuthScope(host, port, AuthScope.ANY_REALM),
				new UsernamePasswordCredentials("fluxltc1", "fLuxThuyu1eP"));
		
		
		String hostUrl = "http://"+host+":"+port;
		
		HttpPost httppost = new HttpPost(hostUrl);
		httppost.setHeader("Content-type", "application/json");

		try {

			JSONObject bitcoinApiCall = new JSONObject();
			bitcoinApiCall.put("id", "1");
			bitcoinApiCall.put("method", method);
			bitcoinApiCall.put("jsonrpc", "1.0");

			String apiCallStr = bitcoinApiCall.toString();

			System.out.println(apiCallStr);

			StringEntity se = new StringEntity(apiCallStr);
			se.setContentEncoding(new BasicHeader(HTTP.CONTENT_TYPE, "application/json"));
			se.setContentType("application/json;charset=UTF-8");

			httppost.setEntity(se);

		} catch(Exception e) {
			e.printStackTrace();
		}

		String result = "";

		try {

			//Execute and get the response.
			HttpResponse httpResponse = httpclient.execute(httppost);
			HttpEntity entity = httpResponse.getEntity();

			if(entity != null) {

				InputStream instream = entity.getContent();

				BufferedReader rd = new BufferedReader(new InputStreamReader(instream));
				System.out.println("Ready to read result...");

				String line = null;
				while((line = rd.readLine()) != null) {
					result += line;
				}

			}


		} catch(Exception e) {

			e.printStackTrace();

		}


		try {

			//System.out.println(result);

			JSONObject jsonResult = new JSONObject(result);

			return jsonResult;

		} catch(JSONException e) {
			
			return null;

		}
		

	}
	
	

}
