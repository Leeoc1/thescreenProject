package com.example.thescreen.csvservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RegionCsvRunner implements CommandLineRunner {

    @Autowired
    private RegionCsvService regionCsvService;

    @Override
    public void run(String... args) throws Exception {
        regionCsvService.importRegionsFromCSV();
    }
}