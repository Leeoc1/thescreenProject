package com.example.thescreen.repository;

import com.example.thescreen.entity.MovieRank;
import com.example.thescreen.entity.MovieView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MovieRankRepository extends JpaRepository<MovieRank, String> {
    @Query("SELECT m FROM MovieRank m WHERE m.movierank IS NOT NULL ORDER BY CAST(m.movierank AS int) ASC")
    List<MovieRank> findMoviesWithRank();
}
