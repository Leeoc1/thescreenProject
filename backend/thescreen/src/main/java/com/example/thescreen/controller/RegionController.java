package com.example.thescreen.controller;

import com.example.thescreen.entity.Region;
import com.example.thescreen.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RegionController {
    @Autowired
    private RegionRepository regionRepository;


    @GetMapping("/regions")
    public List<Region> getRegions() {
        List<Region> regions = regionRepository.findAll();
        return regions;
    }
}
