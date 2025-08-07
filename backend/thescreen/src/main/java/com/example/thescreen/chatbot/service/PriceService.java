package com.example.thescreen.chatbot.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 가격 계산 관련 기능을 담당하는 서비스
 * 연령별 티켓 가격 계산
 */
@Service
public class PriceService {

    private final int ADULT_PRICE = 10000;
    private final int YOUTH_PRICE = 6000;
    private final int SENIOR_PRICE = 5000;

    /**
     * 연령별 가격 계산
     */
    public Map<String, Object> calculatePriceBreakdown(Map<String, Integer> ageBreakdown) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> breakdown = new HashMap<>();

        // null 체크 및 기본값 설정
        if (ageBreakdown == null) {
            ageBreakdown = new HashMap<>();
            ageBreakdown.put("adult", 0);
            ageBreakdown.put("youth", 0);
            ageBreakdown.put("senior", 0);
        }

        int adultCount = ageBreakdown.getOrDefault("adult", 0);
        int youthCount = ageBreakdown.getOrDefault("youth", 0);
        int seniorCount = ageBreakdown.getOrDefault("senior", 0);

        int adultTotal = adultCount * ADULT_PRICE;
        int youthTotal = youthCount * YOUTH_PRICE;
        int seniorTotal = seniorCount * SENIOR_PRICE;
        int totalPrice = adultTotal + youthTotal + seniorTotal;

        breakdown.put("adult", Map.of("count", adultCount, "price", ADULT_PRICE, "total", adultTotal));
        breakdown.put("youth", Map.of("count", youthCount, "price", YOUTH_PRICE, "total", youthTotal));
        breakdown.put("senior", Map.of("count", seniorCount, "price", SENIOR_PRICE, "total", seniorTotal));

        result.put("breakdown", breakdown);
        result.put("totalPrice", totalPrice);

        return result;
    }

    /**
     * 단순 총 가격 계산
     */
    public int calculateTotalPrice(Map<String, Integer> ageBreakdown) {
        int adultCount = ageBreakdown.getOrDefault("adult", 0);
        int youthCount = ageBreakdown.getOrDefault("youth", 0);
        int seniorCount = ageBreakdown.getOrDefault("senior", 0);

        return (adultCount * ADULT_PRICE) + (youthCount * YOUTH_PRICE) + (seniorCount * SENIOR_PRICE);
    }

    /**
     * 가격 정보 조회
     */
    public Map<String, Integer> getPriceInfo() {
        Map<String, Integer> prices = new HashMap<>();
        prices.put("adult", ADULT_PRICE);
        prices.put("youth", YOUTH_PRICE);
        prices.put("senior", SENIOR_PRICE);
        return prices;
    }
}
