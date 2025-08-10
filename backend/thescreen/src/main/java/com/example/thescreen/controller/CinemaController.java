package com.example.thescreen.controller;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.Screen;
import com.example.thescreen.repository.CinemaRepository;
import com.example.thescreen.repository.ScreenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cinemas")
public class CinemaController {
    @Autowired
    private CinemaRepository cinemaRepository;
    
    @Autowired
    private ScreenRepository screenRepository;

    @GetMapping
    public List<Cinema> getCinemas() {
        return cinemaRepository.findAll();
    }
    
    @GetMapping("/{cinemaid}/screens")
    public List<Screen> getScreensByCinema(@PathVariable String cinemaid) {
        return screenRepository.findByCinemacd(cinemaid);
    }
}
