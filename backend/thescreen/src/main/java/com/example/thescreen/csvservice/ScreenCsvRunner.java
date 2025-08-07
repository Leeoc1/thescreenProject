package com.example.thescreen.csvservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ScreenCsvRunner implements CommandLineRunner {
    @Autowired
    private ScreenCsvService screenCsvService;

    @Override
    public void run(String... args) throws Exception {
        screenCsvService.importScreensFromCSV();
    }
}