package com.lenin.project.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;

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
	
	
}

