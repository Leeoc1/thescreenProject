package com.example.thescreen.controller;

import com.example.thescreen.domain.LoginResult;
import com.example.thescreen.entity.User;
import com.example.thescreen.service.UserService;
import com.example.thescreen.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private final UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        LoginResult result = userService.login(user.getUserid(), user.getUserpw());

        switch (result) {
            case SUCCESS:
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "로그인 성공");
                
                // master001인 경우 토큰화하지 않고 평문 userid 저장
                if ("master001".equals(user.getUserid())) {
                    response.put("userid", user.getUserid()); // 평문 userid
                    response.put("isAdmin", true); // 관리자 플래그
                    System.out.println("[관리자 로그인] userid: " + user.getUserid() + " (토큰화 안 함)");
                } else {
                    // 일반 사용자는 기존대로 JWT 토큰으로 암호화
                    String tokenizedUserid = jwtUtil.encodeUserid(user.getUserid());
                    response.put("userid", tokenizedUserid); // 토큰화된 userid
                    response.put("isAdmin", false); // 일반 사용자 플래그
                    System.out.println("[일반 사용자 로그인] userid: " + user.getUserid() + " -> 토큰: " + tokenizedUserid);
                }
                
                return ResponseEntity.ok(response);
                
            case INVALID_PASSWORD:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("비밀번호가 일치하지 않습니다.");
            case WITHDRAWN:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("탈퇴한 회원입니다. 로그인할 수 없습니다.");
            case NOT_FOUND:
            default:
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("아이디가 존재하지 않습니다.");
        }
    }
    
    // 토큰화된 userid 디코딩 API
    @PostMapping("/decode-userid")
    public ResponseEntity<?> decodeUserid(@RequestBody Map<String, String> request) {
        try {
            String tokenizedUserid = request.get("tokenizedUserid");
            
            if (tokenizedUserid == null || tokenizedUserid.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("토큰화된 userid가 없습니다.");
            }
            
            String realUserid = jwtUtil.decodeUserid(tokenizedUserid);
            
            if (realUserid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userid", realUserid);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("[userid 디코딩 오류] " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("디코딩 중 오류가 발생했습니다.");
        }
    }
    
    // 토큰 기반 userid 디코딩 (카카오 로그인용)
    @PostMapping("/decode-token")
    public ResponseEntity<?> decodeToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("토큰이 없습니다.");
            }
            
            String realUserid = jwtUtil.decodeUserid(token);
            
            if (realUserid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userid", realUserid);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("[토큰 디코딩 오류] " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("디코딩 중 오류가 발생했습니다.");
        }
    }
}