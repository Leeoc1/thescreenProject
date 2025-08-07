package com.example.thescreen.repository;


import com.example.thescreen.entity.ReviewView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewViewRepository extends JpaRepository<ReviewView, Integer> {
}
