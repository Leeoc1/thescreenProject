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
        // 한국 시간 기준, 날짜 범위 설정
        LocalDateTime endDate = LocalDate.now(ZoneId.of("Asia/Seoul")).atTime(23, 59, 59);
        LocalDateTime startDate = endDate.minusDays(7);

        // 리포지토리 호출
        List<Object[]> rawResults = reservationViewRepository.findDailySalesBetween(startDate, endDate);

        // Object[]를 Map으로 변환
        List<Map<String, Object>> results = new ArrayList<>();
        for (Object[] row : rawResults) {
            Map<String, Object> result = new HashMap<>();
            result.put("reservationDate", ((java.sql.Date) row[0]).toLocalDate());
            result.put("totalAmount", row[1]);
            results.add(result);
        }

        // 누락된 날짜를 0으로 채우기
        List<Map<String, Object>> finalResults = fillMissingDates(results, startDate.toLocalDate(),
                endDate.toLocalDate());

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