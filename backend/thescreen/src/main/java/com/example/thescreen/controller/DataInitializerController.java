package com.example.thescreen.controller;

import com.example.thescreen.service.DataInitializer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DataInitializerController {
    private final DataInitializer dataInitializer;

    public DataInitializerController(DataInitializer dataInitializer) {
        this.dataInitializer = dataInitializer;
    }

    @GetMapping("/init-users")
    public String initUsers() {
        dataInitializer.insertDummyUsers();
        return "Dummy users inserted successfully!";
    }
}