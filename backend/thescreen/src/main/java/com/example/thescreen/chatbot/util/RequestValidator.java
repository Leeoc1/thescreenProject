package com.example.thescreen.chatbot.util;

import org.springframework.stereotype.Component;

/**
 * 요청 검증 및 처리 유틸리티
 */
@Component
public class RequestValidator {

    /**
     * 입력 문자열 정리 및 검증
     */
    public String cleanAndValidate(String question) {
        if (question == null || question.trim().isEmpty()) {
            throw new IllegalArgumentException("질문이 비어있습니다.");
        }
        return question.trim().toLowerCase();
    }

    /**
     * 자연어 빠른예매 요청인지 판단
     */
    public boolean isQuickBookingRequest(String cleanQuestion) {
        // 기본 빠른예매 키워드
        if (cleanQuestion.contains("가장 빠른 시간") || cleanQuestion.contains("빠른 예매")
                || cleanQuestion.contains("빨리 예매") || cleanQuestion.contains("예매")) {
            return true;
        }

        // 극장명 + 영화명 + 인원 패턴 (예매 키워드 없어도)
        boolean hasTheater = cleanQuestion.contains("점에서") || cleanQuestion.contains("관에서")
                || cleanQuestion.contains("센터에서") || cleanQuestion.contains("극장에서")
                || cleanQuestion.contains("점") || cleanQuestion.contains("관")
                || cleanQuestion.contains("오산") || cleanQuestion.contains("강남") || cleanQuestion.contains("신촌");

        boolean hasPersonCount = cleanQuestion.contains("명") || cleanQuestion.contains("인");

        boolean hasMovieTitle = cleanQuestion.contains("전지적") || cleanQuestion.contains("독자")
                || cleanQuestion.contains("아바타") || cleanQuestion.contains("탑건")
                || cleanQuestion.length() > 5; // 일반적으로 영화 제목이 포함된 긴 문장

        // 극장명과 인원수가 있으면 빠른예매로 판단
        if (hasTheater && hasPersonCount) {
            return true;
        }

        // 극장명과 영화명이 모두 있으면 빠른예매로 판단
        if (hasTheater && hasMovieTitle && cleanQuestion.length() > 10) {
            return true;
        }

        return false;
    }

    /**
     * 예매 데이터 검증
     */
    public boolean isValidBookingData(Object bookingData) {
        // TODO: 예매 데이터 검증 로직 구현
        return bookingData != null;
    }
}
