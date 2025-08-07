package com.example.thescreen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ThescreenApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThescreenApplication.class, args);
	}

}
