package com.example.thescreen.controller;

import com.example.thescreen.entity.ScheduleView;
import com.example.thescreen.repository.ScheduleViewRepository;
import com.example.thescreen.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = { "http://localhost:8080", "http://localhost:3000" })
public class ScheduleViewController {

    @Autowired
    private ScheduleViewRepository scheduleViewRepository;

    @Autowired
    private ScheduleService scheduleService;

    /**
     * 기존 API - 전체 스케줄 조회 (성능 이슈로 사용 지양)
     */
    @GetMapping("/schedules/all")
    public List<ScheduleView> getAllSchedules() {
        return scheduleViewRepository.findAll();
    }

    /**
     * 개선된 API - 오늘 포함 5일간의 스케줄만 조회
     */
    @GetMapping("/schedules")
    public List<ScheduleView> getSchedules(
            @RequestParam(required = false) String cinemaCd,
            @RequestParam(required = false) String date) {
        
        // 파라미터가 있으면 필터링된 결과 반환
        if (cinemaCd != null && !cinemaCd.isEmpty()) {
            return scheduleService.getSchedulesForNext5DaysByCinemaCode(cinemaCd);
        }
        
        // 파라미터가 없으면 전체 스케줄 반환
        return scheduleService.getSchedulesForNext5Days();
    }

    /**
     * 특정 극장의 오늘 포함 5일간 스케줄 조회
     */
    @GetMapping("/schedules/cinema")
    public List<ScheduleView> getSchedulesByCinema(@RequestParam String cinemaName) {
        return scheduleService.getSchedulesForNext5DaysByCinema(cinemaName);
    }

    /**
     * 특정 극장에서 오늘 포함 5일간 상영하는 영화명 목록 조회
     */
    @GetMapping("/schedules/cinema/movies")
    public List<String> getMovieNamesByCinema(@RequestParam String cinemaName) {
        return scheduleService.getMovieNamesForNext5DaysByCinema(cinemaName);
    }
}
