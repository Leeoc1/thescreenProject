package com.example.thescreen.chatbot.service;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {
    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    @Autowired
    private MovieRepository movieRepository;

    public Map<String, Object> askAI(String question) {
        String aiAnswer = generateAiResponse(question);
        return Map.of("type", "ai", "data", Map.of("content", aiAnswer));
    }

    private String generateAiResponse(String question) {
        String lowerQuestion = question.toLowerCase().trim();

        if (lowerQuestion.contains("추천") || lowerQuestion.contains("recommend")) {
            // 지원하는 장르 목록 (필요시 추가)
            String[] genres = {"드라마", "액션", "판타지", "SF", "로맨스", "코미디", "뮤지컬", "공포", "애니메이션", "범죄"};
            String selectedGenre = null;
            for (String genre : genres) {
                if (lowerQuestion.contains(genre)) {
                    selectedGenre = genre;
                    break;
                }
            }

            List<Movie> movies = movieRepository.findByMovieinfo("Y");

            List<Movie> filtered;
            if (selectedGenre != null) {
                // 람다에서 사용할 final 변수로 복사
                final String genreForFilter = selectedGenre;
                filtered = movies.stream()
                    .filter(m -> m.getGenre() != null && m.getGenre().contains(genreForFilter))
                    .toList();
            } else {
                filtered = movies;
            }

            if (filtered.isEmpty()) {
                return "현재 해당 장르의 상영 중인 영화가 없습니다.";
            }

            // 3개 랜덤 추출
            List<Movie> top3;
            if (filtered.size() <= 3) {
                top3 = filtered;
            } else {
                List<Movie> temp = new ArrayList<>(filtered);
                java.util.Collections.shuffle(temp);
                top3 = temp.subList(0, 3);
            }

            StringBuilder movieList = new StringBuilder();
            int idx = 1;
            for (Movie m : top3) {
                String desc = m.getDescription();
                if (desc == null) desc = "";
                // Description이 너무 길면 100자까지만 전달
                if (desc.length() > 100) desc = desc.substring(0, 100) + "...";
                movieList.append(idx).append(". ")
                    .append(m.getMovienm()).append(" (장르: ").append(m.getGenre()).append(") - ")
                    .append(desc).append("\n");
                idx++;
            }
            String prompt = "아래 영화 목록 중 3개의 줄거리를 각각 최대 1줄(20자 이내)로 아주 짧게 요약해서 보여주고, 마지막에 한 작품을 골라 추천 이유를 설명해줘. 반드시 아래 목록에서만 추천해.\n"
                + movieList.toString();
            return callOpenAi(prompt);
        }

        if (lowerQuestion.contains("줄거리") || lowerQuestion.contains("스토리")) {
            // 영화명 추출 (가장 긴 단어 기준)
            List<Movie> movies = movieRepository.findByMovieinfo("Y");

            Movie found = null;
            for (Movie m : movies) {
                String movienm = m.getMovienm();
                // 특수문자 제거
                String cleanTitle = movienm.replaceAll("[\\p{Punct}]", "");
                String[] titleWords = cleanTitle.split(" ");
                int matchCount = 0;
                for (String word : titleWords) {
                    if (!word.isBlank() && question.replaceAll("[\\p{Punct}]", "").contains(word)) {
                        matchCount++;
                    }
                }
                double matchRatio = (double) matchCount / titleWords.length;
                if (matchRatio >= 0.5) {
                    found = m;
                    break;
                }
            }

            if (found != null && found.getDescription() != null && !found.getDescription().isBlank()) {
                String prompt = "아래 영화 줄거리를 100자 이내로 아주 짧게 요약해주고, 마지막에 한 줄로 이 영화의 감상평이나 추천 이유를 덧붙여줘.\n" + found.getDescription();
                return callOpenAi(prompt);
            } else {
                System.out.println("매칭된 영화 없음. 입력된 질문: " + question);
                return "해당 영화의 줄거리 정보를 찾을 수 없습니다.";
            }
        }

        return "지원하지 않는 질문입니다.";
    }

    private String callOpenAi(String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-3.5-turbo");
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);
            body.put("messages", messages);
            body.put("max_tokens", 300);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(OPENAI_API_URL, HttpMethod.POST, entity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                Object choices = responseBody.get("choices");
                if (choices instanceof List<?>) {
                    Map<?, ?> firstChoice = (Map<?, ?>) ((List<?>) choices).get(0);
                    Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                    return message.get("content").toString();
                }
            }
            return "AI 응답을 가져오지 못했습니다.";
        } catch (Exception e) {
            return "OpenAI API 호출 오류: " + e.getMessage();
        }
    }
}
