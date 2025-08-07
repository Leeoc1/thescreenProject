package com.example.thescreen.repository;

import com.example.thescreen.entity.MovieView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieViewRepository extends JpaRepository<MovieView, String> {

    // moviecd로 영화 조회
    MovieView findByMoviecd(String moviecd);
    
    // moviecd로 영화 존재 여부 확인
    boolean existsByMoviecd(String moviecd);

    // moviecd, movienm 추출
    List<MovieCdNmList> findAllBy();

    // 상영 중인 영화만 조회
    List<MovieView> findByMovieinfo(String movieinfo);
    
    // 특정 상태의 영화 개수 조회
    long countByMovieinfo(String movieinfo);

    // 상영 중이면서 현재 상영작인 영화들
    @Query("SELECT m FROM MovieView m WHERE m.movieinfo = 'Y' AND m.releasedate <= :today")
    List<MovieView> findCurrentScreeningMovies(LocalDate today);

    // 상영 중이면서 상영 예정작인 영화들
    @Query("SELECT m FROM MovieView m WHERE m.movieinfo = 'Y' AND m.releasedate > :today")
    List<MovieView> findUpcomingScreeningMovies(LocalDate today);

    // 중복 체크 및 조회
    boolean existsByMovienmAndReleasedate(String movienm, LocalDate releasedate);
    MovieView findByMovienmAndReleasedate(String movienm, LocalDate releasedate);

    // moviecd, movienm 추출 프로젝션
    interface MovieCdNmList {
        String getMoviecd();
        String getMovienm();
    }

    @Query("SELECT MAX(m.releasedate) FROM MovieView m")
    LocalDate findMaxReleasedate();

    List<MovieView> findByReleasedateBetween(LocalDate start, LocalDate end);

    // 박스오피스 순위별 조회 (상위 10개)
    List<MovieView> findTop10ByMovierankIsNotNullOrderByMovierankAsc();

    // 개봉일 기준 정렬
    List<MovieView> findAllByOrderByReleasedateDesc();

    // 영화 제목으로 검색
    List<MovieView> findByMovienmContainingIgnoreCase(String movienm);

    // 감독으로 검색
    List<MovieView> findByDirectorContainingIgnoreCase(String director);

    // 장르로 검색
    List<MovieView> findByGenreContainingIgnoreCase(String genre);

    // 배우로 검색
    List<MovieView> findByActorsContainingIgnoreCase(String actors);
}
