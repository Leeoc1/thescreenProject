package com.example.thescreen.controller;

import com.example.thescreen.service.FetchMovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private FetchMovieService fetchMovieService;

    @GetMapping("/fetch-movie-details")
    public ResponseEntity<String> fetchMovieDetails() {
        try {
            fetchMovieService.fetchMovieDetailsForBoxOffice();
            return ResponseEntity.ok("박스오피스 영화 상세 정보 수집이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("영화 정보 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
