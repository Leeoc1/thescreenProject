package com.example.thescreen.chatbot.service;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.MovieView;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 자연어 분석 관련 기능을 담당하는 서비스
 * 사용자 입력에서 극장, 영화, 인원수 등의 정보를 추출
 */
@Service
public class NaturalLanguageService {

    private final SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * 하이브리드 방식: 패턴 매칭 우선, 실패 시 AI 사용
     */
    public Map<String, Object> extractBookingInfo(String userInput, List<Cinema> cinemas, List<MovieView> movies) {
        // 1단계: 패턴 매칭 시도
        Map<String, Object> patternResult = extractBookingInfoWithPatterns(userInput, cinemas, movies);

        // 2단계: 패턴 매칭 성공 시 바로 반환
        if (!patternResult.containsKey("error")) {
            return patternResult;
        }

        // 3단계: 복잡한 자연어인 경우에만 AI 사용
        if (shouldUseAI(userInput)) {
            return callOpenAIForComplexQuery(userInput, cinemas, movies);
        }

        // 4단계: AI 사용 조건에 맞지 않으면 패턴 매칭 에러 반환
        return patternResult;
    }

    /**
     * AI 사용 여부 판단
     */
    private boolean shouldUseAI(String input) {
        // 영화 추천 관련 키워드
        if (input.contains("추천") || input.contains("어떤") || input.contains("좋은")) {
            return true;
        }

        // 시간 관련 복잡한 표현
        if (input.contains("내일") || input.contains("다음주") || input.contains("주말") ||
                input.contains("저녁") || input.contains("오후") || input.contains("언제")) {
            return true;
        }

        // 장르 관련 키워드
        if (input.contains("로맨스") || input.contains("액션") || input.contains("코미디") ||
                input.contains("가족") || input.contains("데이트")) {
            return true;
        }

        // 기본 정보가 명확하지 않은 경우 (극장명, 영화명이 없음)
        return !containsBasicBookingInfo(input);
    }

    /**
     * 기본 예매 정보 포함 여부 확인
     */
    private boolean containsBasicBookingInfo(String input) {
        // 극장 관련 키워드 확인
        boolean hasCinemaInfo = input.contains("극장") || input.contains("점") ||
                input.contains("cgv") || input.contains("롯데") ||
                input.contains("메가박스") || input.contains("더스크린");

        // 인원수 관련 키워드 확인
        boolean hasPersonInfo = input.contains("명") || input.contains("인") ||
                input.contains("어른") || input.contains("청소년");

        return hasCinemaInfo && hasPersonInfo;
    }

    /**
     * 복잡한 자연어를 위한 OpenAI API 호출
     */
    private Map<String, Object> callOpenAIForComplexQuery(String userInput, List<Cinema> cinemas,
            List<MovieView> movies) {
        try {
            // TODO: OpenAI API 키 설정 및 RestTemplate 추가 필요
            // String prompt = buildSmartPrompt(userInput, cinemas, movies);
            // String aiResponse = callOpenAI(prompt);
            // return parseAIResponse(aiResponse);

            // 현재는 패턴 매칭으로 폴백
            return createResponse("error", Map.of("message",
                    "복잡한 자연어 처리를 위해서는 OpenAI API 설정이 필요합니다. 더 구체적으로 입력해주세요."));
        } catch (Exception e) {
            return createResponse("error", Map.of("message", "처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 패턴 매칭을 통한 예매 정보 추출
     */
    private Map<String, Object> extractBookingInfoWithPatterns(String userInput, List<Cinema> cinemas,
            List<MovieView> movies) {
        String lowerInput = userInput.toLowerCase();
        Map<String, Object> result = new HashMap<>();

        // 극장 찾기
        Cinema matchedCinema = findBestMatchingCinema(lowerInput, cinemas);
        if (matchedCinema == null) {
            return createResponse("error", Map.of("message", "해당 지역의 극장을 찾을 수 없습니다."));
        }

        // 영화 찾기
        MovieView matchedMovie = findBestMatchingMovie(lowerInput, movies);
        if (matchedMovie == null) {
            return createResponse("error", Map.of("message", "해당 영화를 찾을 수 없습니다."));
        }

        // 연령별 인원수 추출
        Map<String, Integer> ageBreakdown = extractPersonCountWithAge(lowerInput);
        int totalPerson = ageBreakdown.values().stream().mapToInt(Integer::intValue).sum();

        result.put("cinemanm", matchedCinema.getCinemanm());
        result.put("cinemacd", matchedCinema.getCinemacd());
        result.put("movienm", matchedMovie.getMovienm());
        result.put("person", totalPerson);
        result.put("ageBreakdown", ageBreakdown);

        return result;
    }

    /**
     * 최적 매칭 극장 찾기
     */
    public Cinema findBestMatchingCinema(String input, List<Cinema> cinemas) {
        // 1. 정확한 이름 매칭
        for (Cinema cinema : cinemas) {
            String cinemaName = cinema.getCinemanm().toLowerCase();
            if (input.contains(cinemaName)) {
                return cinema;
            }
        }

        // 2. 지역명으로 매칭
        String inputLocationName = null;
        if (input.contains("점")) {
            inputLocationName = input.replaceAll("점", "").trim();
        }

        for (Cinema cinema : cinemas) {
            String cinemaName = cinema.getCinemanm().toLowerCase();

            // 극장명에서 지역명 추출
            if (cinemaName.contains("점")) {
                String locationName = cinemaName.substring(cinemaName.lastIndexOf(" ") + 1, cinemaName.indexOf("점"));
                if (input.contains(locationName)) {
                    return cinema;
                }
            }

            // 입력 지역명과 극장명 매칭
            if (inputLocationName != null && cinemaName.contains(inputLocationName)) {
                return cinema;
            }

            // 극장명 키워드 매칭
            String[] cinemaWords = cinemaName.split("\\s+");
            for (String word : cinemaWords) {
                if (word.length() > 1 && input.contains(word)) {
                    return cinema;
                }
            }

            // 주소로 매칭
            if (cinema.getAddress() != null) {
                String[] addressParts = cinema.getAddress().split(" ");
                for (String part : addressParts) {
                    if (input.contains(part.toLowerCase()) && part.length() > 1) {
                        return cinema;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 최적 매칭 영화 찾기
     */
    public MovieView findBestMatchingMovie(String input, List<MovieView> movies) {
        // 1. 정확한 제목 매칭
        for (MovieView movie : movies) {
            String movieName = movie.getMovienm().toLowerCase();
            if (input.contains(movieName)) {
                return movie;
            }
        }

        // 2. 부분 매칭 (키워드 기반)
        for (MovieView movie : movies) {
            String movieName = movie.getMovienm().toLowerCase();
            String[] movieWords = movieName.split("\\s+");

            int matchCount = 0;
            for (String word : movieWords) {
                if (word.length() > 1 && input.contains(word)) {
                    matchCount++;
                }
            }

            double matchRatio = (double) matchCount / movieWords.length;
            if (matchCount > 0 && matchRatio >= 0.5) {
                return movie;
            }
        }

        return null;
    }

    /**
     * 연령별 인원수 추출
     */
    public Map<String, Integer> extractPersonCountWithAge(String input) {
        Map<String, Integer> result = new HashMap<>();
        result.put("adult", 0);
        result.put("youth", 0);
        result.put("senior", 0);

        String lowerInput = input.toLowerCase();

        // 연령별 인원수 추출
        int adultCount = extractSpecificAgeCount(lowerInput, new String[] { "어른", "성인" });
        int youthCount = extractSpecificAgeCount(lowerInput, new String[] { "청소년", "학생" });
        int seniorCount = extractSpecificAgeCount(lowerInput, new String[] { "우대", "경로", "시니어", "노인" });

        result.put("adult", adultCount);
        result.put("youth", youthCount);
        result.put("senior", seniorCount);

        // 총 인원수가 0이면 일반 인원수 추출
        int totalCount = result.values().stream().mapToInt(Integer::intValue).sum();
        if (totalCount == 0) {
            int generalCount = extractGeneralPersonCount(lowerInput);
            result.put("adult", generalCount);
        }

        return result;
    }

    /**
     * 특정 연령대 인원수 추출
     */
    private int extractSpecificAgeCount(String input, String[] keywords) {
        for (String keyword : keywords) {
            // 패턴 1: "어른 1명", "청소년 1명" 등
            Pattern p1 = Pattern.compile(keyword + "\\s+(\\d+)\\s*명");
            Matcher m1 = p1.matcher(input);
            if (m1.find()) {
                return Integer.parseInt(m1.group(1));
            }

            // 패턴 2: "어른1명", "청소년1명" 등
            Pattern p2 = Pattern.compile(keyword + "(\\d+)명");
            Matcher m2 = p2.matcher(input);
            if (m2.find()) {
                return Integer.parseInt(m2.group(1));
            }

            // 패턴 3: "1명 어른", "1명 청소년" 등
            Pattern p3 = Pattern.compile("(\\d+)명\\s+" + keyword);
            Matcher m3 = p3.matcher(input);
            if (m3.find()) {
                return Integer.parseInt(m3.group(1));
            }

            // 패턴 4: "1명어른", "1명청소년" 등
            Pattern p4 = Pattern.compile("(\\d+)명" + keyword);
            Matcher m4 = p4.matcher(input);
            if (m4.find()) {
                return Integer.parseInt(m4.group(1));
            }
        }
        return 0;
    }

    /**
     * 일반적인 인원수 추출
     */
    private int extractGeneralPersonCount(String input) {
        // 연령별 키워드가 있으면 일반 패턴 사용 안함
        if (input.contains("어른") || input.contains("성인") ||
                input.contains("청소년") || input.contains("학생") ||
                input.contains("우대") || input.contains("경로") ||
                input.contains("시니어") || input.contains("노인")) {
            return 0;
        }

        // 간단한 인원수 패턴 확인
        if (input.contains("1명") || input.contains("1인"))
            return 1;
        if (input.contains("2명") || input.contains("2인"))
            return 2;
        if (input.contains("3명") || input.contains("3인"))
            return 3;
        if (input.contains("4명") || input.contains("4인"))
            return 4;
        if (input.contains("5명") || input.contains("5인"))
            return 5;

        // 숫자 추출
        String[] words = input.split("\\s+");
        for (String word : words) {
            try {
                int num = Integer.parseInt(word);
                if (num > 0 && num <= 10) {
                    return num;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        return 2; // 기본값
    }

    /**
     * 시간 검증 유틸리티
     */
    public boolean isAfterNow(String startTimeStr) {
        Date start = parseDate(startTimeStr);
        return start != null && start.after(new Date());
    }

    public Date parseDate(String dateStr) {
        try {
            return dateTimeFormat.parse(dateStr);
        } catch (ParseException e) {
            return null;
        }
    }

    private Map<String, Object> createResponse(String type, Map<String, Object> data) {
        return Map.of("type", type, "data", data);
    }
}
