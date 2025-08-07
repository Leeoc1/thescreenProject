package com.example.thescreen.controller;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import com.example.thescreen.service.NaverLoginService;
import com.example.thescreen.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@RequestMapping("/naver")
@RestController


public class NaverLoginController {

    private final NaverLoginService naverLoginService;

    private final UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> getNaverLoginUrl() {
        try {
            String loginUrl = naverLoginService.getNaverLogin();
            Map<String, String> reponse = new HashMap<>();
            reponse.put("loginUrl", loginUrl);
            return ResponseEntity.ok(reponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("네이버 로그인 URL 생성 실패");
        }
    }

    @GetMapping("/login/callback")
    public ResponseEntity<?> naverCallback(@RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error) throws Exception {

        System.out.println("[네이버 콜백] 요청 시작 - code: " + (code != null ? "있음" : "없음") + 
                          ", state: " + (state != null ? "있음" : "없음") + 
                          ", error: " + error);

        if ("access_denied".equals(error)) {
            // 동의 거부 시
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "네이버 로그인 동의가 취소되었습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            // 1. 액세스 토큰 받기
            Map<String, Object> tokenResponse = naverLoginService.getNaverToken(code, state);

            // 2. 사용자 정보 받기
            Map<String, Object> userInfo = naverLoginService
                    .getNaverUserInfo((String) tokenResponse.get("access_token"));

            // 이미 가입된 회원인지 확인
            String naverId = (String) userInfo.get("id");
            System.out.println("[네이버 콜백] 원본 네이버 ID: " + naverId);
            
            // 네이버 ID 길이 제한 (DB 조회용)
            String searchNaverId = naverId;
            if (searchNaverId != null && searchNaverId.length() > 20) {
                searchNaverId = searchNaverId.substring(0, 20);
            }
            System.out.println("[네이버 콜백] DB 조회용 네이버 ID: " + searchNaverId);
            
            Optional<User> userOpt = userRepository.findById(searchNaverId);

            // 3. 응답 생성
            Map<String, Object> response = new HashMap<>();
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("[네이버 콜백] 기존 회원 - DB userid: " + user.getUserid());
                String tokenizedUserid = jwtUtil.encodeUserid(user.getUserid());
                System.out.println("[네이버 콜백] JWT 토큰 생성 완료");
                response.put("success", true);
                response.put("userInfo", user);
                response.put("userid", tokenizedUserid); // JWT 토큰 추가
                response.put("needSignup", false);
            } else {
                System.out.println("[네이버 콜백] 신규 회원 가입 시작");
                User newUser = naverLoginService.createNaverUser(userInfo);
                System.out.println("[네이버 콜백] 신규 회원 저장 완료 - userid: " + newUser.getUserid());
                Optional<User> savedUserOpt = userRepository.findById(newUser.getUserid());
                User user = savedUserOpt.orElse(newUser);
                String tokenizedUserid = jwtUtil.encodeUserid(user.getUserid());
                System.out.println("[네이버 콜백] JWT 토큰 생성 완료");
                response.put("success", true);
                response.put("userInfo", user);
                response.put("userid", tokenizedUserid); // JWT 토큰 추가
                response.put("needSignup", false);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[네이버 콜백] 오류 발생: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
