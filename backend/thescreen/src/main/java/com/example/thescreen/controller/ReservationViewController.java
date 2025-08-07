package com.example.thescreen.controller;

import com.example.thescreen.entity.ReservationView;
import com.example.thescreen.repository.ReservationViewRepository;
import com.example.thescreen.service.CinemaAmountService;
import com.example.thescreen.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class ReservationViewController {


    @Autowired
    private ReservationViewRepository reservationViewRepository;
    @Autowired
    private ReservationService reservationService;
    @Autowired
    private CinemaAmountService cinemaAmountService;

    @GetMapping("/view/reservation/success")
    public List<ReservationView> getReservation() {
        return reservationViewRepository.findAll();
    }




    @GetMapping("/reservation/week/sum")
    public ResponseEntity<List<Map<String, Object>>> getLast7DaysSales() {
        try {
            List<Map<String, Object>> results = reservationService.getLast7DaysSales();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(Map.of("error", "Failed to fetch sales data")));
        }
    }

    @GetMapping("/reservation/cinema/amount")
    public ResponseEntity<List<Map<String, Object>>> getTotalSalesByCinema() {
        try {
            List<Map<String, Object>> results = cinemaAmountService.getTotalSalesByCinema();
                    return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(Map.of("error", "Fail")));
        }
    }


}
