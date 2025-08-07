package com.example.thescreen.controller;

import com.example.thescreen.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class AdminTokenController {

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getAdminToken(@RequestParam String userid) {
        try {
            String token = jwtUtil.generateAdminToken(userid);
            System.out.println("[관리자 토큰 발급 성공] userid: " + userid + " | " + new java.util.Date());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            System.err.println("[관리자 토큰 발급 실패] " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "토큰 발급 실패"));
        }
    }
}
