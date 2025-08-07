package com.example.thescreen.controller;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.repository.CinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class CinemaController {
    @Autowired
    private CinemaRepository cinemaRepository;

    @GetMapping("/cinemas")
    public List<Cinema> getCinema () {
        List<Cinema> cinemas = cinemaRepository.findAll();

        return cinemas;
    }
}
