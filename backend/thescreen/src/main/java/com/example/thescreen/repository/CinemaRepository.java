package com.example.thescreen.repository;

import com.example.thescreen.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, String> {

    boolean existsByCinemanm(String cinmanm);

    Optional<Cinema> findByCinemanm(String cinemanm);
    List<Cinema> findByCinemanmContainingIgnoreCase(String cinemanm);

    List<Cinema> findByAddressContainingIgnoreCase(String address);
}