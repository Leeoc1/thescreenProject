package com.example.thescreen.service;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void insertDummyUsers() {
        for (int i = 1; i <= 300; i++) {
            User user = new User();
            user.setUserid(String.format("user%03d", i));
            String plainPassword = String.format("pass_%03d", i);
            user.setUserpw(passwordEncoder.encode(plainPassword)); // BCrypt로 해시화
            user.setUsername("테스트" + i + "번");
            user.setEmail("user" + i + "@example.com");
            user.setPhone(String.format("010-%04d-%04d",
                    (int)(Math.random() * 9000) + 1000,
                    (int)(Math.random() * 9000) + 1000));
            user.setBirth(LocalDate.of(1980, 1, 1).plusDays((int)(Math.random() * 9000)));
            user.setStatus("활성");
            user.setReg_date(LocalDate.of(2025, 7, 10).plusDays((int)(Math.random() * 6)));
            userRepository.save(user);
        }
    }
}