package com.example.thescreen.repository;

import com.example.thescreen.entity.ScheduleView;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleViewRepository extends JpaRepository<ScheduleView, String> {
    @Query("SELECT DISTINCT s.movienm FROM ScheduleView s WHERE s.cinemanm LIKE %:cinemanm%")
    List<String> findDistinctMovieNamesByCinemanm(@Param("cinemanm") String cinemanm);

    @Query("SELECT s FROM ScheduleView s WHERE s.cinemanm LIKE %:cinemanm%")
    List<ScheduleView> findByCinemanmContaining(@Param("cinemanm") String cinemanm);

    // 오늘부터 5일 후까지의 스케줄 조회 (전체)
    @Query("SELECT s FROM ScheduleView s WHERE s.startdate >= :startDate AND s.startdate <= :endDate ORDER BY s.startdate, s.starttime")
    List<ScheduleView> findSchedulesByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // 오늘부터 5일 후까지의 스케줄 조회 (극장별)
    @Query("SELECT s FROM ScheduleView s WHERE s.cinemanm LIKE %:cinemanm% AND s.startdate >= :startDate AND s.startdate <= :endDate ORDER BY s.startdate, s.starttime")
    List<ScheduleView> findSchedulesByCinemaAndDateRange(@Param("cinemanm") String cinemanm,
            @Param("startDate") String startDate, @Param("endDate") String endDate);

    // 오늘부터 5일 후까지의 영화명 조회 (극장별)
    @Query("SELECT DISTINCT s.movienm FROM ScheduleView s WHERE s.cinemanm LIKE %:cinemanm% AND s.startdate >= :startDate AND s.startdate <= :endDate")
    List<String> findDistinctMovieNamesByCinemaAndDateRange(@Param("cinemanm") String cinemanm,
            @Param("startDate") String startDate, @Param("endDate") String endDate);

    // Cinema 코드를 통한 스케줄 조회 (Cinema 코드를 이름으로 변환하여 조회)
    @Query("SELECT s FROM ScheduleView s WHERE s.cinemanm IN " +
           "(SELECT c.cinemanm FROM Cinema c WHERE c.cinemacd = :cinemacd) " +
           "AND s.startdate >= :startDate AND s.startdate <= :endDate ORDER BY s.startdate, s.starttime")
    List<ScheduleView> findSchedulesByCinemaCodeAndDateRange(@Param("cinemacd") String cinemacd,
            @Param("startDate") String startDate, @Param("endDate") String endDate);
}