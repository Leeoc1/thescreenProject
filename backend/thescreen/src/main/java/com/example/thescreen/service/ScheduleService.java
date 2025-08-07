package com.example.thescreen.service;

import com.example.thescreen.entity.MovieView;
import com.example.thescreen.entity.Schedule;
import com.example.thescreen.entity.ScheduleView;
import com.example.thescreen.repository.MovieViewRepository;
import com.example.thescreen.repository.ScheduleRepository;
import com.example.thescreen.repository.ScheduleViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private static final Random RANDOM = new Random();
    private static final int TOTAL_DAYS = 30;
    private static final int SCHEDULES_PER_MOVIE = 10000;
    private static final int MIN_HOUR_GAP = 3;

    @Autowired
    private MovieViewRepository movieViewRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ScheduleViewRepository scheduleViewRepository;


    @Transactional
    public String generateDummySchedules() {
        try {
            System.out.println("=== 스케줄 생성 서비스 시작 ===");
            LocalDate startDate = LocalDate.now(); // 오늘 날짜
            LocalDate endDate = startDate.plusDays(TOTAL_DAYS - 1); // 30일 후
            System.out.println("시작 날짜: " + startDate + ", 종료 날짜: " + endDate);

            // 마지막 날짜에 스케줄이 있는지 확인
            boolean hasSchedules = scheduleRepository.existsByStartdate(endDate);
            System.out.println("해당 날짜에 기존 스케줄 존재 여부: " + hasSchedules);
            if (hasSchedules) {
                return String.format("해당 날짜(%s)에 대한 스케줄이 이미 등록되었습니다.", endDate);
            }

            // 탑 10 영화 조회
            System.out.println("영화 데이터 조회 중...");
            List<MovieView> allMovies = movieViewRepository.findMoviesWithRank();
            System.out.println("조회된 전체 영화 수: " + allMovies.size());
            
            List<MovieView> movies = allMovies.stream()
                    .filter(movie -> !scheduleRepository.existsByMoviecd(movie.getMoviecd()))
                    .collect(Collectors.toList());
            System.out.println("스케줄 생성 대상 영화 수: " + movies.size());

            System.out.println("스케줄 생성 대상 영화 목록:");
            for (MovieView movie : movies) {
                // runningtime 확인 및 로깅 (수정하지 않음)
                int actualRunningTime = (movie.getRunningtime() != null && movie.getRunningtime() > 0) 
                    ? movie.getRunningtime() 
                    : 120; // 기본값
                    
                if (movie.getRunningtime() == null || movie.getRunningtime() <= 0) {
                    System.out.println(String.format("영화 코드: %s, 영화 이름: %s, 상영시간: %d분 (기본값 적용)",
                            movie.getMoviecd(), movie.getMovienm(), actualRunningTime));
                } else {
                    System.out.println(String.format("영화 코드: %s, 영화 이름: %s, 상영시간: %d분",
                            movie.getMoviecd(), movie.getMovienm(), actualRunningTime));
                }
            }
            
            if (movies.isEmpty()) {
                return "스케줄을 생성할 수 있는 영화가 없습니다. 영화 데이터를 먼저 등록해주세요.";
            }
            
            List<String> screens = generateScreenCodes();
            System.out.println("생성된 상영관 코드 수: " + screens.size());
            Map<String, List<Schedule>> screenSchedules = new HashMap<>();
            for (String screen : screens) {
                screenSchedules.put(screen,
                        scheduleRepository.findByScreencdAndStartdateBetween(screen, startDate, endDate));
            }

            StringBuilder sqlOutput = new StringBuilder();
            sqlOutput.append(
                    "INSERT INTO schedule (schedulecd, moviecd, screencd, startdate, starttime, endtime) VALUES\n");

            int totalSchedules = 0;
            for (MovieView movie : movies) {
                // runningtime 안전하게 처리
                int actualRunningTime = (movie.getRunningtime() != null && movie.getRunningtime() > 0) 
                    ? movie.getRunningtime() 
                    : 120; // 기본값
                    
                // 기존 스케줄 여부 확인
                boolean hasPreviousSchedules = scheduleRepository.existsByMoviecd(movie.getMoviecd());
                List<LocalDate> targetDates = hasPreviousSchedules ? List.of(endDate) : // 기존/재진입 영화: 마지막 날만
                        generateDateRange(startDate, endDate); // 신규 영화: 30일 모두

                int schedulesPerDay = SCHEDULES_PER_MOVIE / Math.max(1, targetDates.size()); // 균등 분배
                for (LocalDate date : targetDates) {
                    for (int i = 0; i < schedulesPerDay; i++) {
                        String scheduleCode = generateScheduleCode();
                        String screenCode = screens.get(RANDOM.nextInt(screens.size()));
                        LocalDateTime startTime = generateValidStartTime(screenSchedules.get(screenCode), date,
                                actualRunningTime);

                        if (startTime != null) {
                            LocalDateTime endTime = startTime.plusMinutes(actualRunningTime);
                            Schedule schedule = new Schedule();
                            schedule.setSchedulecd(scheduleCode);
                            schedule.setMoviecd(movie.getMoviecd());
                            schedule.setScreencd(screenCode);
                            schedule.setStartdate(date);
                            schedule.setStarttime(startTime);
                            schedule.setEndtime(endTime);
                            scheduleRepository.save(schedule);
                            screenSchedules.get(screenCode).add(schedule);

                            sqlOutput.append(String.format("('%s', '%s', '%s', '%s', '%s', '%s')%s\n",
                                    scheduleCode, movie.getMoviecd(), screenCode, date,
                                    startTime.toString().replace("T", " "), endTime.toString().replace("T", " "),
                                    (i < schedulesPerDay - 1 || !isLastMovieAndDate(movies, movie, date, targetDates))
                                            ? ","
                                            : ";"));
                            totalSchedules++;
                        }
                    }
                }
            }

            // SQL 파일 저장
            try (FileWriter writer = new FileWriter("schedule_inserts_" + startDate + ".sql")) {
                writer.write(sqlOutput.toString());
            } catch (IOException e) {
                throw new RuntimeException("SQL 파일 작성 실패: " + e.getMessage());
            }

            return String.format("%s에 대한 스케줄 %d개 생성 완료", endDate, totalSchedules);
        } catch (Exception e) {
            throw new RuntimeException("스케줄 생성 실패: " + e.getMessage());
        }
    }

    private List<String> generateScreenCodes() {
        List<String> screens = new ArrayList<>();
        for (int i = 1; i <= 826; i++) {
            screens.add(String.format("SCR%03d", i));
        }
        return screens;
    }

    private String generateScheduleCode() {
        String code;
        do {
            code = "SCH" + String.format("%06d", RANDOM.nextInt(1000000));
        } while (scheduleRepository.existsById(code));
        return code;
    }

    private LocalDateTime generateValidStartTime(List<Schedule> existingSchedules, LocalDate date, int runningTime) {
        LocalTime startOfDay = LocalTime.of(8, 0); // 8 AM
        LocalTime endOfDay = LocalTime.of(23, 59); // 11:59 PM
        int maxAttempts = 50;

        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            int minutes = RANDOM.nextInt((endOfDay.toSecondOfDay() - startOfDay.toSecondOfDay()) / 60);
            LocalDateTime proposedStart = LocalDateTime.of(date, startOfDay.plusMinutes(minutes));

            if (isValidStartTime(existingSchedules, proposedStart, runningTime)) {
                return proposedStart;
            }
        }
        return null;
    }

    private boolean isValidStartTime(List<Schedule> existingSchedules, LocalDateTime proposedStart, int runningTime) {
        LocalDateTime proposedEnd = proposedStart.plusMinutes(runningTime);
        for (Schedule schedule : existingSchedules) {
            if (schedule.getStartdate().equals(proposedStart.toLocalDate())) {
                LocalDateTime existingStart = schedule.getStarttime();
                LocalDateTime existingEnd = schedule.getEndtime();
                LocalDateTime minGapStart = existingStart.minusHours(MIN_HOUR_GAP);
                LocalDateTime minGapEnd = existingEnd.plusHours(MIN_HOUR_GAP);

                if ((proposedStart.isAfter(minGapStart) && proposedStart.isBefore(minGapEnd)) ||
                        (proposedEnd.isAfter(minGapStart) && proposedEnd.isBefore(minGapEnd))) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isLastMovieAndDate(List<MovieView> movies, MovieView movie, LocalDate date,
            List<LocalDate> targetDates) {
        return movies.indexOf(movie) == movies.size() - 1 && date.equals(targetDates.get(targetDates.size() - 1));
    }

    private List<LocalDate> generateDateRange(LocalDate start, LocalDate end) {
        List<LocalDate> dates = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            dates.add(date);
        }
        return dates;
    }

    /**
     * 오늘 포함 5일간의 전체 영화 스케줄 조회
     * 
     * @return 5일간의 스케줄 리스트
     */
    public List<ScheduleView> getSchedulesForNext5Days() {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(4);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String startDateStr = today.format(formatter);
        String endDateStr = endDate.format(formatter);

        return scheduleViewRepository.findSchedulesByDateRange(startDateStr, endDateStr);
    }

    /**
     * 오늘 포함 5일간의 특정 극장 영화 스케줄 조회
     * 
     * @param cinemaName 극장명
     * @return 5일간의 해당 극장 스케줄 리스트
     */
    public List<ScheduleView> getSchedulesForNext5DaysByCinema(String cinemaName) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(4);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String startDateStr = today.format(formatter);
        String endDateStr = endDate.format(formatter);

        return scheduleViewRepository.findSchedulesByCinemaAndDateRange(cinemaName, startDateStr, endDateStr);
    }

    /**
     * 오늘 포함 5일간의 특정 극장에서 상영하는 영화명 목록 조회
     * 
     * @param cinemaName 극장명
     * @return 5일간의 해당 극장 상영 영화명 리스트
     */
    public List<String> getMovieNamesForNext5DaysByCinema(String cinemaName) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(4);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String startDateStr = today.format(formatter);
        String endDateStr = endDate.format(formatter);

        return scheduleViewRepository.findDistinctMovieNamesByCinemaAndDateRange(cinemaName, startDateStr, endDateStr);
    }
}