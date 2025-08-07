package com.example.thescreen.repository;

import com.example.thescreen.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, String> {
    List<Screen> findByCinemacd(String cinemacd);
}