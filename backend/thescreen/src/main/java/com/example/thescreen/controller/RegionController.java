package com.example.thescreen.controller;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.Region;
import com.example.thescreen.repository.CinemaRepository;
import com.example.thescreen.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/regions")
public class RegionController {
    @Autowired
    private RegionRepository regionRepository;
    
    @Autowired
    private CinemaRepository cinemaRepository;

    @GetMapping
    public List<Region> getRegions() {
        return regionRepository.findAll();
    }
    
    @GetMapping("/{regioncd}/cinemas")
    public List<Cinema> getCinemasByRegion(@PathVariable String regioncd) {
        return cinemaRepository.findByRegioncd(regioncd);
    }
}
