package com.example.thescreen.chatbot.service;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.MovieView;
import com.example.thescreen.entity.ScheduleView;
import com.example.thescreen.repository.*;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 검색 관련 기능을 담당하는 서비스
 * FAQ, 공지사항, 영화, 극장 검색 기능 제공
 */
@Service
public class SearchService {

    private final FaqRepository faqRepository;
    private final NoticeRepository noticeRepository;
    private final MovieViewRepository movieViewRepository; // MovieViewRepository 사용으로 변경
    private final CinemaRepository cinemaRepository;
    private final ScheduleViewRepository scheduleViewRepository;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public SearchService(FaqRepository faqRepository, NoticeRepository noticeRepository,
            MovieViewRepository movieViewRepository, CinemaRepository cinemaRepository,
            ScheduleViewRepository scheduleViewRepository) {
        this.faqRepository = faqRepository;
        this.noticeRepository = noticeRepository;
        this.movieViewRepository = movieViewRepository; // MovieViewRepository 주입
        this.cinemaRepository = cinemaRepository;
        this.scheduleViewRepository = scheduleViewRepository;
    }

    /** ========================== FAQ 검색 ========================== */
    public Map<String, Object> searchFAQ(String cleanQuestion) {
        // "FAQ" 키워드가 있으면 FAQ 목록 반환
        if (cleanQuestion.toLowerCase().contains("faq") || cleanQuestion.contains("자주") || 
            cleanQuestion.contains("질문") || cleanQuestion.contains("문의")) {
            List<Map<String, Object>> faqList = faqRepository.findAll().stream()
                    .limit(10)
                    .map(faq -> Map.<String, Object>of(
                            "title", faq.getFaqsub(),
                            "content", faq.getFaqcontents()))
                    .collect(Collectors.toList());
            if (!faqList.isEmpty()) {
                return createResponse("faq_list", Map.of("faqs", faqList));
            }
        }
        
        return faqRepository.findByFaqsubContainingIgnoreCase(cleanQuestion).stream()
                .findFirst()
                .map(faq -> createResponse("faq", Map.of("content", faq.getFaqcontents())))
                .orElseGet(() -> findByWordMatch(faqRepository.findAll(), cleanQuestion,
                        faq -> faq.getFaqsub(), faq -> faq.getFaqcontents(), "faq"));
    }

    /** ========================== 공지사항 검색 ========================== */
    public Map<String, Object> searchNotice(String cleanQuestion) {
        // "공지사항" 키워드가 있으면 공지사항 목록 반환
        if (cleanQuestion.contains("공지사항") || cleanQuestion.contains("공지") || 
            cleanQuestion.contains("알림") || cleanQuestion.contains("안내")) {
            List<Map<String, Object>> noticeList = noticeRepository.findAll().stream()
                    .limit(10)
                    .map(notice -> Map.<String, Object>of(
                            "id", notice.getNoticenum(),
                            "title", notice.getNoticesub(),
                            "content", notice.getNoticecontents()))
                    .collect(Collectors.toList());
            if (!noticeList.isEmpty()) {
                return createResponse("notice_list", Map.of("notices", noticeList));
            }
        }
        
        return noticeRepository.findByNoticesubContainingIgnoreCase(cleanQuestion).stream()
                .findFirst()
                .map(n -> createResponse("notice", Map.of("content", n.getNoticecontents())))
                .orElseGet(() -> findByWordMatch(noticeRepository.findAll(), cleanQuestion,
                        n -> n.getNoticesub(), n -> n.getNoticecontents(), "notice"));
    }

    /** ========================== TOP10 영화 검색 ========================== */
    public Map<String, Object> searchTopMovies(String cleanQuestion) {
        if (cleanQuestion.contains("탑10") || cleanQuestion.contains("top10") || 
            cleanQuestion.contains("인기 영화") || cleanQuestion.contains("박스오피스") ||
            cleanQuestion.contains("순위")) {
            List<MovieView> topMovies = movieViewRepository.findTop10ByMovierankIsNotNullOrderByMovierankAsc(); // MovieView 사용
            if (!topMovies.isEmpty()) {
                List<Map<String, String>> movieList = topMovies.stream()
                        .limit(10)
                        .map(m -> Map.of("name", m.getMovienm(), "rank", String.valueOf(m.getMovierank()), "moviecd", m.getMoviecd()))
                        .collect(Collectors.toList());
                return createResponse("top10", Map.of("movies", movieList));
            }
        }
        return null;
    }

    /** ========================== 영화 검색 ========================== */
    public Map<String, Object> searchMovie(String cleanQuestion) {
        // "극장" 단독 키워드는 영화 검색에서 제외
        if (cleanQuestion.trim().equals("극장")) {
            return null;
        }
        
        return movieViewRepository.findByMovienmContainingIgnoreCase(cleanQuestion).stream() // MovieView 사용
                .findFirst()
                .map(this::createMovieResponse)
                .orElseGet(() -> findByWordMatch(movieViewRepository.findAll(), cleanQuestion,
                        MovieView::getMovienm, this::createMovieResponse, null)); // MovieView 사용
    }

    /** ========================== 극장 검색 ========================== */
    public Map<String, Object> searchCinema(String cleanQuestion) {
        // "극장" 키워드만 있으면 모든 극장 목록 반환
        if (cleanQuestion.contains("극장") && !containsSpecificLocation(cleanQuestion)) {
            List<Map<String, Object>> cinemaList = cinemaRepository.findAll().stream()
                    .map(cinema -> Map.<String, Object>of(
                            "id", cinema.getCinemacd(),
                            "name", cinema.getCinemanm(),
                            "address", Optional.ofNullable(cinema.getAddress()).orElse("주소 정보 없음"),
                            "tel", Optional.ofNullable(cinema.getTel()).orElse("전화번호 정보 없음")))
                    .collect(Collectors.toList());
            if (!cinemaList.isEmpty()) {
                return createResponse("cinema_list", Map.of("cinemas", cinemaList));
            }
        }
        
        List<Cinema> regionCinemas = cinemaRepository.findByAddressContainingIgnoreCase(cleanQuestion);
        if (!regionCinemas.isEmpty()) {
            List<Map<String, Object>> cinemaList = regionCinemas.stream()
                    .limit(10)
                    .map(c -> Map.<String, Object>of(
                            "name", c.getCinemanm(),
                            "address", Optional.ofNullable(c.getAddress()).orElse("주소 정보 없음"),
                            "cinemacd", c.getCinemacd()))
                    .collect(Collectors.toList());
            return createResponse("suggestion", Map.of("cinemas", cinemaList));
        }

        return cinemaRepository.findByCinemanmContainingIgnoreCase(cleanQuestion).stream()
                .findFirst()
                .map(cinema -> {
                    List<String> movieNames = scheduleViewRepository
                            .findDistinctMovieNamesByCinemanm(cinema.getCinemanm());
                    if (movieNames.isEmpty()) {
                        movieNames = scheduleViewRepository.findByCinemanmContaining(cinema.getCinemanm()).stream()
                                .map(ScheduleView::getMovienm).distinct().collect(Collectors.toList());
                    }
                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("cinemaname", cinema.getCinemanm());
                    responseData.put("cinemaaddress", Optional.ofNullable(cinema.getAddress()).orElse("주소 정보 없음"));
                    responseData.put("cinemastatus", Optional.ofNullable(cinema.getStatus()).orElse("상태 정보 없음"));
                    responseData.put("cinematel", Optional.ofNullable(cinema.getTel()).orElse("전화번호 정보 없음"));
                    responseData.put("cinemacd", String.valueOf(cinema.getCinemacd()));
                    responseData.put("movies", movieNames);
                    return createResponse("cinema", responseData);
                })
                .orElse(null);
    }
    
    private boolean containsSpecificLocation(String question) {
        return question.contains("강남") || question.contains("홍대") || question.contains("잠실") ||
               question.contains("신촌") || question.contains("명동") || question.contains("동대문") ||
               question.contains("영등포") || question.contains("구로") || question.contains("목동") ||
               question.contains("천호") || question.contains("왕십리") || question.contains("노원") ||
               question.contains("마포") || question.contains("서초") || question.contains("송파") ||
               question.contains("부산") || question.contains("대구") || question.contains("인천");
    }

    /** ========================== 극장별 상영 영화 검색 ========================== */
    public Map<String, Object> searchCinemaMovies(String cleanQuestion) {
        List<ScheduleView> allSchedules = scheduleViewRepository.findAll();

        // 1차 정확 매칭
        List<String> movieNames = scheduleViewRepository.findDistinctMovieNamesByCinemanm(cleanQuestion);

        // 2차 부분 매칭
        if (movieNames.isEmpty()) {
            movieNames = scheduleViewRepository.findByCinemanmContaining(cleanQuestion).stream()
                    .map(ScheduleView::getMovienm).distinct().collect(Collectors.toList());
        }

        // 3차 키워드 포함
        if (movieNames.isEmpty()) {
            movieNames = allSchedules.stream()
                    .filter(s -> Optional.ofNullable(s.getCinemanm()).orElse("").toLowerCase()
                            .contains(cleanQuestion.toLowerCase()))
                    .map(ScheduleView::getMovienm).distinct().collect(Collectors.toList());
        }

        if (movieNames.isEmpty())
            return null;

        if (movieNames.size() > 10) {
            return createResponse("cinemamovies", Map.of(
                    "cinemamovies", movieNames.stream().limit(10).toList(),
                    "totalCount", movieNames.size(),
                    "message", "총 " + movieNames.size() + "개의 영화가 상영 중입니다. 상위 10개를 표시합니다.",
                    "hasMore", true));
        }
        return createResponse("cinemamovies", Map.of("cinemamovies", movieNames));
    }

    /** ========================== 유틸리티 메서드 ========================== */
    private boolean isWordMatch(String title, String question) {
        String[] words = question.split("\\s+");
        long matchCount = Arrays.stream(words)
                .filter(w -> w.length() > 1 && title.contains(w))
                .count();
        return (double) matchCount / words.length >= 0.5;
    }

    private <T> Map<String, Object> findByWordMatch(List<T> items, String cleanQuestion,
            java.util.function.Function<T, String> titleExtractor,
            java.util.function.Function<T, Object> contentExtractor,
            String type) {
        return items.stream()
                .filter(i -> isWordMatch(titleExtractor.apply(i).toLowerCase(), cleanQuestion))
                .findFirst()
                .map(i -> {
                    Object content = contentExtractor.apply(i);
                    if (content instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> mapContent = (Map<String, Object>) content;
                        return mapContent;
                    } else {
                        return createResponse(type, Map.of("content", content));
                    }
                })
                .orElse(null);
    }

    private Map<String, Object> createResponse(String type, Map<String, Object> data) {
        return Map.of("type", type, "data", data);
    }

    private Map<String, Object> createMovieResponse(MovieView movie) { // MovieView 파라미터로 변경
        String releaseDateStr = movie.getReleasedate() != null ? movie.getReleasedate().toString() : "미공개";
        return createResponse("movie", Map.of(
                "name", movie.getMovienm(),
                "genre", movie.getGenre(),
                "movieinfo", Optional.ofNullable(movie.getDescription()).orElse(movie.getMovieinfo()),
                "releasedate", releaseDateStr,
                "runningtime", movie.getRunningtime(),
                "moviecd", movie.getMoviecd()));
    }
}
