package com.example.thescreen.chatbot;

import com.example.thescreen.chatbot.service.AiService;
import com.example.thescreen.chatbot.service.BookingService;
import com.example.thescreen.chatbot.service.DataService;
import com.example.thescreen.chatbot.service.SearchService;
import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.Faq;
import com.example.thescreen.entity.MovieView;
import com.example.thescreen.entity.Notice;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 챗봇 메인 서비스 - 각 전문 서비스를 조합하여 통합된 기능 제공
 */
@Service
public class ChatBotService {

    private final SearchService searchService;
    private final BookingService bookingService;
    private final DataService dataService;
    private final AiService aiService;

    public ChatBotService(SearchService searchService,
            BookingService bookingService,
            DataService dataService,
            AiService aiService) {
        this.searchService = searchService;
        this.bookingService = bookingService;
        this.dataService = dataService;
        this.aiService = aiService;
    }

    /** ========================== 검색 기능 위임 ========================== */
    public Map<String, Object> searchFAQ(String cleanQuestion) {
        return searchService.searchFAQ(cleanQuestion);
    }

    public Map<String, Object> searchNotice(String cleanQuestion) {
        return searchService.searchNotice(cleanQuestion);
    }

    public Map<String, Object> searchTopMovies(String cleanQuestion) {
        return searchService.searchTopMovies(cleanQuestion);
    }

    public Map<String, Object> searchMovie(String cleanQuestion) {
        return searchService.searchMovie(cleanQuestion);
    }

    public Map<String, Object> searchCinema(String cleanQuestion) {
        return searchService.searchCinema(cleanQuestion);
    }

    public Map<String, Object> searchCinemaMovies(String cleanQuestion) {
        return searchService.searchCinemaMovies(cleanQuestion);
    }

    /** ========================== 예매 기능 위임 ========================== */
    public Map<String, Object> processNaturalLanguageBooking(String userInput) {
        List<Cinema> allCinemas = dataService.getAllCinemas();
        List<MovieView> allMovies = dataService.getAllMovies();
        return bookingService.processNaturalLanguageBooking(userInput, allCinemas, allMovies);
    }

    public Map<String, Object> directBookingConfirm(Map<String, Object> bookingData) {
        return bookingService.directBookingConfirm(bookingData);
    }

    /** ========================== AI 질의 응답 ========================== */
    public Map<String, Object> askQuestion(String question) {
        String cleanQuestion = question.toLowerCase().trim();
        Map<String, Object> dbResult = getExistingResponse(cleanQuestion);
        if (dbResult != null && !"error".equals(dbResult.get("type"))) {
            return dbResult;
        }
        // DB에 없거나 error면 AI에게 질문 전달
        return aiService.askAI(question);
    }

    /** ========================== 기존 DB 기반 응답 ========================== */
    private Map<String, Object> getExistingResponse(String question) {
        String cleanQuestion = question.toLowerCase().trim();

        return Optional.ofNullable(searchFAQ(cleanQuestion))
                .or(() -> Optional.ofNullable(searchNotice(cleanQuestion)))
                .or(() -> Optional.ofNullable(searchTopMovies(cleanQuestion)))
                .or(() -> Optional.ofNullable(searchMovie(cleanQuestion)))
                .or(() -> Optional.ofNullable(searchCinema(cleanQuestion)))
                .or(() -> Optional.ofNullable(searchCinemaMovies(cleanQuestion)))
                .orElse(createResponse("error", Map.of("message", "질문을 이해하지 못했습니다.")));
    }

    /** ========================== 데이터 조회 위임 ========================== */
    public List<Faq> getAllFaqs() {
        return dataService.getAllFaqs();
    }

    public List<Notice> getAllNotices() {
        return dataService.getAllNotices();
    }

    public List<MovieView> getAllMovies() {
        return dataService.getAllMovies();
    }

    public List<Cinema> getAllCinemas() {
        return dataService.getAllCinemas();
    }

    /** ========================== 유틸리티 ========================== */
    private Map<String, Object> createResponse(String type, Map<String, Object> data) {
        return Map.of("type", type, "data", data);
    }
}
