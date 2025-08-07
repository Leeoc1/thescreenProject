package com.example.thescreen.chatbot;

import com.example.thescreen.chatbot.service.AiService;
import com.example.thescreen.chatbot.util.RequestValidator;
import com.example.thescreen.chatbot.util.ResponseUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 챗봇 REST API 컨트롤러 - 간소화된 버전
 * 요청 처리와 응답 생성에만 집중
 */
@RestController
@RequestMapping("/chatbot")
public class ChatBotController {

    private final ChatBotService chatBotService;
    private final AiService aiService;
    private final RequestValidator requestValidator;
    private final ResponseUtil responseUtil;

    public ChatBotController(ChatBotService chatBotService,
            AiService aiService,
            RequestValidator requestValidator,
            ResponseUtil responseUtil) {
        this.chatBotService = chatBotService;
        this.aiService = aiService;
        this.requestValidator = requestValidator;
        this.responseUtil = responseUtil;
    }

    /**
     * 챗봇 질문 처리 메인 엔드포인트
     */
    @GetMapping("/ask")
    public ResponseEntity<Map<String, Object>> ask(@RequestParam String question) {
        long startTime = System.currentTimeMillis();

        try {
            // 1. 입력 검증 및 정리
            String cleanQuestion = requestValidator.cleanAndValidate(question);

            // 2. AI 우선 처리 (추천, 줄거리 관련 질문을 가장 먼저 확인)
            String lowerQuestion = cleanQuestion.toLowerCase();
            System.out.println("=== AI 키워드 확인 ===");
            System.out.println("원본 질문: " + question);
            System.out.println("정리된 질문: " + cleanQuestion);
            System.out.println("소문자 질문: " + lowerQuestion);
            System.out.println("추천 포함: " + lowerQuestion.contains("추천"));
            System.out.println("recommend 포함: " + lowerQuestion.contains("recommend"));
            System.out.println("줄거리 포함: " + lowerQuestion.contains("줄거리"));
            System.out.println("스토리 포함: " + lowerQuestion.contains("스토리"));

            if (lowerQuestion.contains("추천") || lowerQuestion.contains("recommend") ||
                    lowerQuestion.contains("줄거리") || lowerQuestion.contains("스토리")) {
                System.out.println("AI 키워드 매칭됨! AI 서비스로 직접 전달");
                Map<String, Object> response = aiService.askAI(cleanQuestion);
                responseUtil.logResponse(startTime, response.toString(), "AI 최우선 응답");
                return responseUtil.createSuccessResponse(response);
            } else {
                System.out.println("AI 키워드 매칭 안됨, 일반 로직으로 진행");
            }

            // 3. 요청 타입 판별 및 처리
            Map<String, Object> response;
            if (requestValidator.isQuickBookingRequest(cleanQuestion)) {
                response = chatBotService.processNaturalLanguageBooking(question);
                responseUtil.logResponse(startTime, response.toString(), "자연어 예매");
            } else {
                response = processGeneralQuestion(cleanQuestion, startTime);
            }

            return responseUtil.createSuccessResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            return responseUtil.createErrorResponse("서버 내부 오류가 발생했습니다.", 500, startTime);
        }
    }

    /**
     * 직접 예매 확인
     */
    @PostMapping("/direct-booking")
    public ResponseEntity<Map<String, Object>> directBookingConfirm(@RequestBody Map<String, Object> bookingData) {
        try {
            Map<String, Object> result = chatBotService.directBookingConfirm(bookingData);
            return responseUtil.createSuccessResponse(result);
        } catch (Exception e) {
            e.printStackTrace();
            return responseUtil.createErrorResponse("예매 처리 중 오류가 발생했습니다.", 500, System.currentTimeMillis());
        }
    }

    /**
     * CORS 옵션 처리
     */
    @RequestMapping(value = "/ask", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return responseUtil.createOptionsResponse();
    }

    /**
     * 일반 질문 처리 (검색 순서대로)
     */
    private Map<String, Object> processGeneralQuestion(String cleanQuestion, long startTime) {
        Map<String, Object> response;

        // 1. FAQ 검색
        response = chatBotService.searchFAQ(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "FAQ 검색");
            return response;
        }

        // 2. 공지사항 검색
        response = chatBotService.searchNotice(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "공지사항 검색");
            return response;
        }

        // 3. TOP10 영화 검색
        response = chatBotService.searchTopMovies(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "TOP10 영화 검색");
            return response;
        }

        // 4. 영화 검색
        response = chatBotService.searchMovie(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "영화 검색");
            return response;
        }

        // 5. 극장 검색
        response = chatBotService.searchCinema(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "극장 검색");
            return response;
        }

        // 6. 극장별 영화 검색
        response = chatBotService.searchCinemaMovies(cleanQuestion);
        if (response != null) {
            responseUtil.logResponse(startTime, response.toString(), "극장별 영화 검색");
            return response;
        }

        // 7. 기본 AI 응답
        response = chatBotService.askQuestion(cleanQuestion);
        responseUtil.logResponse(startTime, response.toString(), "기본 응답");
        return response;
    }
}
