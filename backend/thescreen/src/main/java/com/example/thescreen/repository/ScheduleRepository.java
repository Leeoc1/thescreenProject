package com.example.thescreen.repository;

import com.example.thescreen.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {

    // 임시 테이블 생성 (5개 행)
    @Modifying
    @Transactional
    @Query(value = "DROP TEMPORARY TABLE IF EXISTS temp_nums; " +
            "CREATE TEMPORARY TABLE temp_nums (n INT); " +
            "INSERT INTO temp_nums (n) SELECT ROW_NUMBER() OVER () - 1 AS N " +
            "FROM information_schema.tables LIMIT 5", nativeQuery = true)
    void createTempNums();

    // 스케줄 생성/업데이트
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO schedule (schedulecd, moviecd, screencd, startdate, starttime, endtime) " +
            "SELECT " +
            "  CONCAT('SCH', LPAD(:baseIndex + (@row_number:=@row_number+1) - 1, 6, '0')), " +
            "  :moviecd, " +
            "  :screencd, " +
            "  DATE(start_time), " +
            "  start_time, " +
            "  TIMESTAMPADD(MINUTE, :runningtime, start_time) " +
            "FROM (" +
            "  SELECT TIMESTAMPADD(SECOND, FLOOR(RAND() * (14 * 3600)), " +
            "         DATE_ADD(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 14) DAY) + INTERVAL 9 HOUR) as start_time " +
            "  FROM temp_nums t WHERE t.n < :numSchedules" +
            ") random_times " +
            "CROSS JOIN (SELECT @row_number:=0) r " +
            "WHERE NOT EXISTS (" +
            "  SELECT 1 FROM schedule s WHERE s.screencd = :screencd " +
            "  AND s.startdate = DATE(random_times.start_time) " +
            "  AND (s.starttime <= TIMESTAMPADD(MINUTE, :runningtime + 60, random_times.start_time) " +
            "       AND s.endtime >= random_times.start_time)" +
            ") " +
            "AND (SELECT COUNT(*) FROM schedule s WHERE s.screencd = :screencd " +
            "     AND s.startdate = DATE(random_times.start_time)) < 5 " +
            "AND start_time <= DATE_ADD(DATE_ADD(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 14) DAY) + INTERVAL 23 HOUR, INTERVAL - :runningtime MINUTE)", nativeQuery = true)
    void insertOrUpdateSchedules(
            @Param("baseIndex") int baseIndex,
            @Param("moviecd") String moviecd,
            @Param("screencd") String screencd,
            @Param("runningtime") int runningtime,
            @Param("numSchedules") int numSchedules);

    // 시간대 충돌 체크
    @Query("SELECT COUNT(*) FROM Schedule s WHERE s.screencd = :screencd " +
            "AND s.startdate = :startdate " +
            "AND ((s.starttime <= :endtime AND s.endtime >= :starttime))")
    int countOverlappingSchedules(
            @Param("screencd") String screencd,
            @Param("startdate") LocalDate startdate,
            @Param("starttime") LocalDateTime starttime,
            @Param("endtime") LocalDateTime endtime);

    // 날짜별 스케줄 수 확인
    @Query("SELECT COUNT(*) FROM Schedule s WHERE s.screencd = :screencd AND s.startdate = :startdate")
    int countSchedulesByDate(
            @Param("screencd") String screencd,
            @Param("startdate") LocalDate startdate);

    // 상영관별 스케줄 조회
    @Query("SELECT s FROM Schedule s WHERE s.screencd = :screencd ORDER BY s.starttime")
    List<Schedule> findByScreencd(@Param("screencd") String screencd);

    // 영화별 스케줄 조회
    @Query("SELECT s FROM Schedule s WHERE s.moviecd = :moviecd ORDER BY s.starttime")
    List<Schedule> findByMoviecd(@Param("moviecd") String moviecd);

    // 시간 겹침이 있는 스케줄 찾기
    @Query("SELECT s FROM Schedule s WHERE s.screencd = :screencd " +
            "AND ((s.starttime < :endtime AND s.endtime > :starttime))")
    List<Schedule> findConflictingSchedules(
            @Param("screencd") String screencd,
            @Param("starttime") LocalDateTime starttime,
            @Param("endtime") LocalDateTime endtime);

    // 자기 자신을 제외한 시간 겹침이 있는 스케줄 찾기
    @Query("SELECT s FROM Schedule s WHERE s.screencd = :screencd " +
            "AND s.schedulecd != :schedulecd " +
            "AND ((s.starttime < :endtime AND s.endtime > :starttime))")
    List<Schedule> findConflictingSchedulesExcludingCurrent(
            @Param("schedulecd") String schedulecd,
            @Param("screencd") String screencd,
            @Param("starttime") LocalDateTime starttime,
            @Param("endtime") LocalDateTime endtime);

    boolean existsByStartdate(LocalDate date);
    boolean existsByMoviecd(String moviecd);
    boolean existsById(String schedulecd);
    List<Schedule> findByScreencdAndStartdateBetween(String screencd, LocalDate start, LocalDate end);
}