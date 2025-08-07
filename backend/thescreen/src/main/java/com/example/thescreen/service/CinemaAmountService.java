package com.example.thescreen.service;

import com.example.thescreen.repository.ReservationViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CinemaAmountService {
    @Autowired
    private ReservationViewRepository reservationViewRepository;
    public List<Map<String, Object>> getTotalSalesByCinema() {
        List<Object[]> rawResults = reservationViewRepository.findTotalSalesByCinema();
        List<Map<String, Object>> results = new ArrayList<>();
        for(Object[] row: rawResults) {
            Map<String, Object> result = new HashMap<>();
            result.put("cinemaName", row[0]); // cinemanm
            result.put("totalAmount", row[1]); // SUM(amount)
            results.add(result);
        }
        return results;
    }
}
