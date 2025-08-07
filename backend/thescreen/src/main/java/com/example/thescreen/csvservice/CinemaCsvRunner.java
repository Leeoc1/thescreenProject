package com.example.thescreen.csvservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CinemaCsvRunner implements CommandLineRunner {
    @Autowired
    private CinemaCsvService cinemaCsvService;

    @Override
    public void run(String... args) throws Exception {
        cinemaCsvService.importCinemasFromCSV();
    }
}