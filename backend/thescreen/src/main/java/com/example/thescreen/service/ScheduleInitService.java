package com.example.thescreen.service;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.entity.Schedule;
import com.example.thescreen.entity.Screen;
import com.example.thescreen.repository.MovieRepository;
import com.example.thescreen.repository.ScheduleRepository;
import com.example.thescreen.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleInitService implements CommandLineRunner {

    private final ScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;

    @Override
    public void run(String... args) throws Exception {
        // 애플리케이션 시작 후 스케줄 생성 상태 확인
        checkScheduleInitStatus();
        
        // 스케줄이 부족하면 생성
        generateSchedulesIfNeeded();
    }

    @Transactional
    public void generateSchedulesIfNeeded() {
        try {
            long currentScheduleCount = scheduleRepository.count();
            long screenCount = screenRepository.count();
            long expectedSchedules = screenCount * 2 * 5 * 10; // 상영관 × 2일 × 5시간 × 10개영화
            
            if (currentScheduleCount < expectedSchedules) {
                log.info("스케줄 데이터 생성 중...");
                
                // 박스오피스 1~10위 영화 찾기
                List<Movie> topMovies = movieRepository.findTop10ByMovierankIsNotNullOrderByMovierankAsc();
                if (topMovies.isEmpty()) {
                    log.warn("박스오피스 영화가 없어서 스케줄 생성을 건너뜁니다.");
                    return;
                }
                
                List<Screen> screens = screenRepository.findAll();
                
                LocalDate today = LocalDate.now();
                LocalDate tomorrow = today.plusDays(1);
                
                int scheduleCount = 0;
                
                // 각 영화, 각 상영관, 각 날짜, 각 시간에 스케줄 생성
                for (int movieIndex = 0; movieIndex < Math.min(topMovies.size(), 10); movieIndex++) {
                    Movie currentMovie = topMovies.get(movieIndex);
                    
                    for (Screen screen : screens) {
                        for (LocalDate date : List.of(today, tomorrow)) {
                            for (int hour : List.of(10, 13, 16, 19, 21)) {
                                int screenIndex = screens.indexOf(screen) + 1;
                                int dayOffset = (date.equals(today)) ? 0 : 1;
                                String scheduleId = String.format("SCH%03d%d%02d%02d", screenIndex, dayOffset, hour, movieIndex + 1);
                                    
                                // 중복 체크
                                if (!scheduleRepository.existsById(scheduleId)) {
                                    Schedule schedule = new Schedule();
                                    schedule.setSchedulecd(scheduleId);
                                    schedule.setMoviecd(currentMovie.getMoviecd());
                                    schedule.setScreencd(screen.getScreencd());
                                    schedule.setStartdate(date);
                                    schedule.setStarttime(LocalDateTime.of(date, LocalDateTime.now().withHour(hour).withMinute(0).toLocalTime()));
                                    schedule.setEndtime(schedule.getStarttime().plusHours(2));
                                    
                                    scheduleRepository.save(schedule);
                                    scheduleCount++;
                                }
                            }
                        }
                    }
                }
                
                log.info("박스오피스 1~10위 영화 스케줄 데이터 생성 완료: {}개", scheduleCount);
                
            } else {
                log.info("스케줄 데이터가 이미 존재합니다. ({}개)", currentScheduleCount);
            }
            
        } catch (Exception e) {
            log.error("스케줄 생성 중 오류: ", e);
        }
    }

    private void checkScheduleInitStatus() {
        try {
            long scheduleCount = scheduleRepository.count();
            long expectedSchedules = screenRepository.count() * 2 * 5 * 10; // 상영관 × 2일 × 5시간 × 10개영화
            
            if (scheduleCount >= expectedSchedules) {
                log.info("박스오피스 1~10위 영화 스케줄 데이터 로드 완료: {}개", scheduleCount);
            }
            
        } catch (Exception e) {
            log.error("스케줄 상태 확인 중 오류 발생: ", e);
        }
    }
}