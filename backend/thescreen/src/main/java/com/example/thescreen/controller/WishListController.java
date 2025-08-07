package com.example.thescreen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import java.util.List;

import com.example.thescreen.service.WishListService;

@RestController
@RequestMapping("/api/wishlist")
public class WishListController {

    @Autowired
    private WishListService wishListService;

    // 영화별 찜 카운트와 내 찜 여부 반환
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getWishlistStatus(
            @RequestParam String userid,
            @RequestParam String moviecd) {
        int count = wishListService.countByMoviecd(moviecd);
        boolean wished = wishListService.isWishedByUser(userid, moviecd);
        Map<String, Object> result = new HashMap<>();
        result.put("count", count);
        result.put("wished", wished);
        return ResponseEntity.ok(result);
    }

    // 찜 추가/해제 토글
    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleWishlist(
            @RequestParam String userid,
            @RequestParam String moviecd) {
        boolean newWishedStatus = wishListService.toggleWishlist(userid, moviecd);
        int count = wishListService.countByMoviecd(moviecd);
        Map<String, Object> result = new HashMap<>();
        result.put("wished", newWishedStatus);
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    // 내가 찜한 영화 목록 반환
    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> getUserWishlist(@RequestParam String userid) {
        List<Map<String, Object>> wishList = wishListService.findWishedMovieInfoByUser(userid);
        return ResponseEntity.ok(wishList);
    }
}
