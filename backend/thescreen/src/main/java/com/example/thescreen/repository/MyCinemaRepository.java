package com.example.thescreen.repository;

import com.example.thescreen.entity.MyCinema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MyCinemaRepository extends JpaRepository<MyCinema, Integer> {
    Optional<MyCinema> findByUseridAndCinemacd(String userid, String cinemacd);
    List<MyCinema> findByUserid(String userid);
    void deleteByUseridAndCinemacd(String userid, String cinemacd);
}
