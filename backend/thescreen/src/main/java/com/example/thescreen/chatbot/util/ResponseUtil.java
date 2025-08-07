package com.example.thescreen.chatbot.util;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * HTTP 응답 생성 유틸리티
 */
@Component
public class ResponseUtil {

    /**
     * 성공 응답 생성
     */
    public ResponseEntity<Map<String, Object>> createSuccessResponse(Map<String, Object> data) {
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Content-Type", "application/json")
                .body(data);
    }

    /**
     * 에러 응답 생성
     */
    public ResponseEntity<Map<String, Object>> createErrorResponse(String message, int statusCode, long startTime) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("type", "error");
        errorResponse.put("data", Map.of("content", message));

        logResponse(startTime, errorResponse.toString(), "에러 응답");

        return ResponseEntity.status(statusCode)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Content-Type", "application/json")
                .body(errorResponse);
    }

    /**
     * OPTIONS 요청 응답
     */
    public ResponseEntity<?> createOptionsResponse() {
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Max-Age", "3600")
                .build();
    }

    /**
     * 응답 로깅
     */
    public void logResponse(long startTime, String response, String searchType) {
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;
        System.out.println(
                "Search Type: " + searchType + ", Processing Time: " + processingTime + "ms, Response: " + response);
    }
}
