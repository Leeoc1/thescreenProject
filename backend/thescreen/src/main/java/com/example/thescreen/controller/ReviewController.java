package com.example.thescreen.controller;

import com.example.thescreen.entity.Review;
import com.example.thescreen.entity.ReviewView;
import com.example.thescreen.repository.ReviewRepository;
import com.example.thescreen.repository.ReviewViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewViewRepository reviewViewRepository;

    // 모든 리뷰 조회
    @GetMapping("/review")
    public List<ReviewView> getAllReviews() {
        return reviewViewRepository.findAll();
    }

    // 새 리뷰 작성(프론트에서 받아서 저장)
    @PostMapping("/review")
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        review.setReviewdate(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }
}
