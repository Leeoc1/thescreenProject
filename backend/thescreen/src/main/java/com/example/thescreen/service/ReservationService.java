package com.example.thescreen.service;

import com.example.thescreen.repository.ReservationViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReservationService {
    @Autowired
    private ReservationViewRepository reservationViewRepository;

    public List<Map<String, Object>> getLast7DaysSales() {
        // 오늘 2025-07-08 05:28 PM KST 기준, 날짜 범위 설정
        LocalDateTime endDate = LocalDate.now(ZoneId.of("Asia/Seoul")).atTime(23, 59, 59);
        LocalDateTime startDate = endDate.minusDays(7);

        System.out.println("=== getLast7DaysSales 디버깅 ===");
        System.out.println("시작 날짜: " + startDate);
        System.out.println("종료 날짜: " + endDate);

        // 리포지토리 호출
        List<Object[]> rawResults = reservationViewRepository.findDailySalesBetween(startDate, endDate);

        System.out.println("원본 쿼리 결과:");
        for (Object[] row : rawResults) {
            System.out.println("날짜: " + row[0] + ", 매출: " + row[1]);
        }

        // Object[]를 Map으로 변환
        List<Map<String, Object>> results = new ArrayList<>();
        for (Object[] row : rawResults) {
            Map<String, Object> result = new HashMap<>();
            result.put("reservationDate", ((java.sql.Date) row[0]).toLocalDate());
            result.put("totalAmount", row[1]);
            results.add(result);
        }

        System.out.println("변환된 결과:");
        for (Map<String, Object> result : results) {
            System.out.println("날짜: " + result.get("reservationDate") + ", 매출: " + result.get("totalAmount"));
        }

        // 누락된 날짜를 0으로 채우기
        List<Map<String, Object>> finalResults = fillMissingDates(results, startDate.toLocalDate(),
                endDate.toLocalDate());

        System.out.println("최종 결과 (누락된 날짜 0으로 채움):");
        for (Map<String, Object> result : finalResults) {
            System.out.println("날짜: " + result.get("reservationDate") + ", 매출: " + result.get("totalAmount"));
        }
        System.out.println("=== 디버깅 끝 ===");

        return finalResults;
    }

    private List<Map<String, Object>> fillMissingDates(List<Map<String, Object>> results, LocalDate startDate,
            LocalDate endDate) {
        List<Map<String, Object>> filledResults = new ArrayList<>();
        for (LocalDate date = endDate; !date.isBefore(startDate); date = date.minusDays(1)) {
            LocalDate finalDate = date;
            Optional<Map<String, Object>> sale = results.stream()
                    .filter(s -> ((LocalDate) s.get("reservationDate")).equals(finalDate))
                    .findFirst();
            Map<String, Object> result = new HashMap<>();
            result.put("reservationDate", finalDate);
            result.put("totalAmount", sale.isPresent() ? sale.get().get("totalAmount") : 0);
            filledResults.add(result);
        }
        return filledResults;
    }
}