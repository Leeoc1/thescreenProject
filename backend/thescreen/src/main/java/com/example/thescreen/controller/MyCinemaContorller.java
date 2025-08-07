package com.example.thescreen.controller;

import com.example.thescreen.entity.MyCinema;
import com.example.thescreen.repository.MyCinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/mycinema")
public class MyCinemaContorller {
    @Autowired
    private MyCinemaRepository myCinemaRepository;

    @PostMapping
    public ResponseEntity<MyCinema> updateFavorite(
            @RequestBody MyCinema request,
            @RequestHeader("Authorization") String authHeader) {
        String userid = request.getUserid();
        String cinemacd = request.getCinemacd();

        if (userid == null || cinemacd == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<MyCinema> existing = myCinemaRepository.findByUseridAndCinemacd(userid, cinemacd);
        MyCinema myCinema;

        if (existing.isPresent()) {
            // 이미 존재하면 그대로 반환 (중복 방지)
            myCinema = existing.get();
        } else {
            // 새로 추가
            myCinema = new MyCinema();
            myCinema.setUserid(userid);
            myCinema.setCinemacd(cinemacd);
            // status는 기본값 true로 설정됨 (Entity에서)
        }

        MyCinema saved = myCinemaRepository.save(myCinema);
        return ResponseEntity.ok(saved);
    }

    @GetMapping()
    public ResponseEntity<List<MyCinema>> getFavorites(
            @RequestParam String userid,
            @RequestHeader("Authorization") String authHeader) {
        if (userid == null) {
            return ResponseEntity.badRequest().build();
        }
        List<MyCinema> favorites = myCinemaRepository.findByUserid(userid);
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> deleteFavorite(
            @RequestParam String userid,
            @RequestParam String cinemacd,
            @RequestHeader("Authorization") String authHeader) {
        if (userid == null || cinemacd == null) {
            return ResponseEntity.badRequest().build();
        }
        myCinemaRepository.deleteByUseridAndCinemacd(userid, cinemacd);
        return ResponseEntity.noContent().build();
    }
}