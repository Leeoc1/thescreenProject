package com.example.thescreen.repository;

import com.example.thescreen.entity.MovieWithSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MovieWIthScheduleRepository extends JpaRepository<MovieWithSchedule, String> {

    // TOP 10 박스오피스 영화 (movierank가 있는 영화만) - 모든 필드 조회
    @Query(value = "SELECT * FROM moviewithschedule WHERE movierank IS NOT NULL " +
            "ORDER BY CAST(movierank AS INTEGER) ASC LIMIT 10", nativeQuery = true)
    List<MovieWithSchedule> findTop10MoviesWithRank();

    // 현재 상영작 조회 - 모든 필드 조회
    @Query(value = "SELECT * FROM moviewithschedule WHERE movieinfo IN ('Y', 'N') " +
            "ORDER BY releasedate DESC", nativeQuery = true)
    List<MovieWithSchedule> findCurrentScreeningMovies(LocalDate today);

    // 상영 예정작 조회 - 모든 필드 조회
    @Query(value = "SELECT * FROM moviewithschedule WHERE movieinfo = 'E' AND releasedate > :today " +
            "ORDER BY releasedate ASC", nativeQuery = true)
    List<MovieWithSchedule> findUpcomingScreeningMovies(LocalDate today);
}
