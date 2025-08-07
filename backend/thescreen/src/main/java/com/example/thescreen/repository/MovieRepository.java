package com.example.thescreen.repository;

import com.example.thescreen.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, String> {

    // moviecd로 영화 조회
    Movie findByMoviecd(String moviecd);

    // moviecd, movienm 추출
    List<MovieCdNmList> findAllBy();

    // 상영 중인 영화만 조회
    List<Movie> findByMovieinfo(String movieinfo);

    // 상영 중이면서 현재 상영작인 영화들
    @Query("SELECT m FROM Movie m WHERE m.movieinfo = 'Y' AND m.releasedate <= :today")
    List<Movie> findCurrentScreeningMovies(LocalDate today);

    // 상영 중이면서 상영 예정작인 영화들
    @Query("SELECT m FROM Movie m WHERE m.movieinfo = 'Y' AND m.releasedate > :today")
    List<Movie> findUpcomingScreeningMovies(LocalDate today);

    // 중복 체크 및 조회
    boolean existsByMovienmAndReleasedate(String movienm, LocalDate releasedate);
    Movie findByMovienmAndReleasedate(String movienm, LocalDate releasedate);

    // moviecd, movienm 추출 프로젝션
    interface MovieCdNmList {
        String getMoviecd();
        String getMovienm();
    }

    @Query("SELECT MAX(m.releasedate) FROM Movie m")
    LocalDate findMaxReleasedate();

    List<Movie> findByReleasedateBetween(LocalDate start, LocalDate end);

    List<Movie> findByReleasedateAfter(LocalDate date);

    List<Movie> findByReleasedateBefore(LocalDate date);

    List<Movie> findByReleasedate(LocalDate date);
}