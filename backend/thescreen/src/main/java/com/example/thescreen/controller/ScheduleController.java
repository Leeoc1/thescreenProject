package com.example.thescreen.controller;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.entity.Schedule;
import com.example.thescreen.repository.MovieRepository;
import com.example.thescreen.repository.ScheduleRepository;
import com.example.thescreen.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateSchedules(
            @RequestParam String moviecd,
            @RequestParam List<String> screencds) {
        try {
            if (moviecd == null || moviecd.isEmpty() || screencds == null || screencds.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "영화 코드와 상영관 코드를 입력하세요.");
                return ResponseEntity.badRequest().body(result);
            }

            Optional<Movie> movieOpt = movieRepository.findById(moviecd);
            if (!movieOpt.isPresent()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "영화가 존재하지 않습니다: " + moviecd);
                return ResponseEntity.badRequest().body(result);
            }
            int runningtime = movieOpt.get().getRunningtime();
            if (runningtime <= 0) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "영화 러닝타임이 유효하지 않습니다: " + moviecd);
                return ResponseEntity.badRequest().body(result);
            }

            final int NUM_SCHEDULES = 5;
            int baseIndex = (int) (System.currentTimeMillis() % 100000);
            Map<String, Integer> failedSchedules = new HashMap<>();
            int totalCreated = 0;

            for (String screencd : screencds) {
                int createdForScreen = 0;
                scheduleRepository.createTempNums();

                try {
                    List<Schedule> existingSchedules = scheduleRepository.findByScreencd(screencd);
                    scheduleRepository.insertOrUpdateSchedules(baseIndex, moviecd, screencd, runningtime, NUM_SCHEDULES);
                    createdForScreen = NUM_SCHEDULES;

                    List<Schedule> updatedSchedules = scheduleRepository.findByScreencd(screencd);
                    if (updatedSchedules.size() >= NUM_SCHEDULES) {
                        for (int i = 0; i < NUM_SCHEDULES; i++) {
                            Schedule schedule = updatedSchedules.get(updatedSchedules.size() - NUM_SCHEDULES + i);
                            LocalDateTime startTime = schedule.getStarttime();
                            LocalDateTime endTime = startTime.plusMinutes(runningtime);
                            if (scheduleRepository.countOverlappingSchedules(screencd, startTime.toLocalDate(), startTime, endTime) > 0) {
                                System.out.println("겹침 발견: screencd=" + screencd + ", startTime=" + startTime + ", endTime=" + endTime);
                            }
                        }
                    }
                    totalCreated += createdForScreen;
                } catch (Exception e) {
                    System.out.println("스케줄 생성 실패: 상영관=" + screencd + ", 오류=" + e.getMessage());
                    failedSchedules.put(screencd, NUM_SCHEDULES);
                }

                baseIndex += NUM_SCHEDULES;
            }

            Map<String, Object> result = new HashMap<>();
            if (failedSchedules.isEmpty()) {
                result.put("success", true);
                result.put("message", String.format("스케줄 %d개 생성/업데이트 완료 (영화: %s, 상영관: %s)",
                        totalCreated, moviecd, String.join(",", screencds)));
            } else {
                result.put("success", totalCreated > 0);
                StringBuilder message = new StringBuilder();
                message.append(String.format("스케줄 %d개 생성/업데이트 완료 (영화: %s, 상영관: %s)",
                        totalCreated, moviecd, String.join(",", screencds)));
                if (!failedSchedules.isEmpty()) {
                    message.append(". 실패한 스케줄: ");
                    failedSchedules.forEach((screencd, count) ->
                            message.append(String.format("%s(%d개), ", screencd, count)));
                }
                result.put("message", message.toString().replaceAll(", $", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "스케줄 생성/업데이트 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}