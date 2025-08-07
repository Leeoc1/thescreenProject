package com.example.thescreen.controller;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/google")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class GoogleController {

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client.id:}")
    private String googleClientId;

    /**
     * Google OAuth 클라이언트 ID 제공
     */
    @GetMapping("/client-id")
    public Map<String, String> getGoogleClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("clientId", googleClientId);
        return response;
    }

    @PostMapping("/login")
    public User googleLogin(@RequestBody Map<String, Object> googleUserData) {
        try {
            // Google 사용자 정보에서 필요한 데이터 추출
            String googleId = (String) googleUserData.get("sub");
            String userid = ("google_" + googleId).substring(0, 20); // Google 접두사 추가 후 20자로 제한
            String username = (String) googleUserData.get("name");
            String email = (String) googleUserData.get("email");
            
            // 생년월일 처리
            LocalDate birthDate = null;
            if (googleUserData.get("birthdays") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> birthdays = (List<Map<String, Object>>) googleUserData.get("birthdays");
                if (!birthdays.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dateObj = (Map<String, Object>) birthdays.get(0).get("date");
                    if (dateObj != null) {
                        Integer year = (Integer) dateObj.get("year");
                        Integer month = (Integer) dateObj.get("month");
                        Integer day = (Integer) dateObj.get("day");
                        if (year != null && month != null && day != null) {
                            birthDate = LocalDate.of(year, month, day);
                        }
                    }
                }
            }
            
            // 전화번호 처리
            String phoneNumber = null;
            if (googleUserData.get("phoneNumbers") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> phoneNumbers = (List<Map<String, Object>>) googleUserData.get("phoneNumbers");
                if (!phoneNumbers.isEmpty()) {
                    phoneNumber = (String) phoneNumbers.get(0).get("value");
                }
            }
            
            // 이미 존재하는 사용자인지 확인
            if (userRepository.existsById(userid)) {
                // 기존 사용자 정보 업데이트
                User existingUser = userRepository.findById(userid).orElse(null);
                if (existingUser != null) {
                    existingUser.setUsername(username);
                    existingUser.setEmail(email);
                    if (phoneNumber != null) {
                        existingUser.setPhone(phoneNumber);
                    }
                    if (birthDate != null) {
                        existingUser.setBirth(birthDate);
                    }
                    return userRepository.save(existingUser);
                }
            }
            
            // 새 사용자 생성
            User newUser = new User();
            newUser.setUserid(userid);
            newUser.setUserpw(null); // 소셜 로그인이므로 비밀번호 없음
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPhone(phoneNumber);
            newUser.setBirth(birthDate);
            newUser.setStatus("활성");
            newUser.setReg_date(LocalDate.now());
            
            return userRepository.save(newUser);
            
        } catch (Exception e) {
            System.err.println("Google 로그인 처리 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
