package com.example.thescreen.repository;

import com.example.thescreen.entity.MovieView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieViewRepository extends JpaRepository<MovieView, String> {

    //처음 데이터 많이 집어넣을 때만 활용
    @Query("SELECT m FROM MovieView m WHERE m.movierank IS NOT NULL ORDER BY CAST(m.movierank AS int) ASC")
    List<MovieView> findMoviesWithRank();
    List<MovieView> findByMovienmContainingIgnoreCase(String movienm);
}