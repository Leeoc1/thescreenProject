package com.example.thescreen.service;

import com.example.thescreen.entity.ScheduleView;
import com.example.thescreen.repository.ScheduleViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleViewRepository scheduleViewRepository;

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

    /**
     * 오늘 포함 5일간의 특정 극장(코드 기준)에서의 스케줄 조회
     * 
     * @param cinemaCode 극장 코드
     * @return 5일간의 해당 극장 스케줄 리스트
     */
    public List<ScheduleView> getSchedulesForNext5DaysByCinemaCode(String cinemaCode) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(4);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String startDateStr = today.format(formatter);
        String endDateStr = endDate.format(formatter);

        return scheduleViewRepository.findSchedulesByCinemaCodeAndDateRange(cinemaCode, startDateStr, endDateStr);
    }
}