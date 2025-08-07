package com.example.thescreen.controller;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:3000"})
public class TestController {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/password-check")
    public Map<String, Object> testPasswordCheck(@RequestBody Map<String, String> request) {
        String inputPassword = request.get("password");
        String storedHash = request.get("hash");
        
        boolean matches = passwordEncoder.matches(inputPassword, storedHash);
        
        Map<String, Object> result = new HashMap<>();
        result.put("inputPassword", inputPassword);
        result.put("storedHash", storedHash);
        result.put("matches", matches);
        
        // 새로 해시화해보기
        String newHash = passwordEncoder.encode(inputPassword);
        result.put("newHash", newHash);
        
        return result;
    }
    
    @GetMapping("/hash-pass_001")
    public Map<String, Object> hashPass001() {
        String dbHash = "$2a$10$EixZaYvK1fsbw1ZfbX3OXePaWxn96p36WQNguSBqAuisafLkKARZa";
        
        // 가능한 비밀번호들 테스트
        String[] possiblePasswords = {
            "pass_001",
            "password", 
            "admin",
            "master",
            "123456",
            "master001",
            "pass001",
            "admin123",
            "password123",
            "1234",
            "test",
            "secret"
        };
        
        Map<String, Object> result = new HashMap<>();
        result.put("dbHash", dbHash);
        
        for (String password : possiblePasswords) {
            boolean matches = passwordEncoder.matches(password, dbHash);
            result.put("password_" + password, matches);
            if (matches) {
                result.put("correctPassword", password);
            }
        }
        
        return result;
    }
    
    @GetMapping("/test-login")
    public Map<String, Object> testLogin() {
        try {
            User masterUser = userRepository.findById("master001").orElse(null);
            if (masterUser == null) {
                return Map.of("error", "master001 사용자가 존재하지 않습니다.");
            }
            
            String testPassword = "pass_001";
            boolean matches = passwordEncoder.matches(testPassword, masterUser.getUserpw());
            
            Map<String, Object> result = new HashMap<>();
            result.put("userid", masterUser.getUserid());
            result.put("testPassword", testPassword);
            result.put("storedHash", masterUser.getUserpw());
            result.put("matches", matches);
            result.put("status", masterUser.getStatus());
            
            if (matches) {
                result.put("loginTest", "SUCCESS - 로그인 가능");
            } else {
                result.put("loginTest", "FAIL - 비밀번호 불일치");
            }
            
            return result;
        } catch (Exception e) {
            return Map.of("error", "테스트 중 오류 발생: " + e.getMessage());
        }
    }
}
