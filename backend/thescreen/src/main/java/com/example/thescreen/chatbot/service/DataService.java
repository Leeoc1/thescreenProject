package com.example.thescreen.chatbot.service;

import com.example.thescreen.entity.*;
import com.example.thescreen.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 데이터 접근 관련 기능을 담당하는 서비스
 * 각 Repository의 데이터 조회를 중앙 집중식으로 관리
 */
@Service
public class DataService {

    private final FaqRepository faqRepository;
    private final NoticeRepository noticeRepository;
    private final MovieViewRepository movieViewRepository;
    private final CinemaRepository cinemaRepository;
    private final ScheduleViewRepository scheduleViewRepository;

    public DataService(FaqRepository faqRepository,
            NoticeRepository noticeRepository,
            MovieViewRepository movieViewRepository,
            CinemaRepository cinemaRepository,
            ScheduleViewRepository scheduleViewRepository) {
        this.faqRepository = faqRepository;
        this.noticeRepository = noticeRepository;
        this.movieViewRepository = movieViewRepository;
        this.cinemaRepository = cinemaRepository;
        this.scheduleViewRepository = scheduleViewRepository;
    }

    /** ========================== 전체 데이터 조회 ========================== */
    public List<Faq> getAllFaqs() {
        return faqRepository.findAll();
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public List<MovieView> getAllMovies() {
        return movieViewRepository.findAll();
    }

    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    public List<ScheduleView> getAllSchedules() {
        return scheduleViewRepository.findAll();
    }
}
