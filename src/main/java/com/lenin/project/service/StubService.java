package com.lenin.project.service;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;

import com.lenin.project.domain.Entry;
import com.lenin.project.repositories.StubRepository;


@Path("/")
public class StubService {
	
	@Autowired
	private StubRepository stubRepository;
	
	public StubService() {
		
	}
	
	
	@GET
    @Path("/test")
    @Produces({ MediaType.TEXT_PLAIN })
    public String test() {
        return "Test OK!";
    }
	
	
	@POST
    @Path("/entry")
    @Produces({ MediaType.TEXT_PLAIN })
	@Consumes({ MediaType.APPLICATION_JSON })
    public String addEntry(Entry entry) {
        
		System.out.println(entry.getFrom());
		return "OK!";
    
	}
	
	
}

