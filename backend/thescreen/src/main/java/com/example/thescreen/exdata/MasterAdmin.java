package com.example.thescreen.exdata;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MasterAdmin {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (!userRepository.existsById("master001")) {
            User admin = new User();
            admin.setUserid("master001");
            admin.setUserpw(passwordEncoder.encode("pass_001")); // 해시!
            admin.setUsername("김관리");
            admin.setEmail("master1@example.com");
            admin.setPhone("01011112222");
            admin.setBirth(LocalDate.parse("1995-05-01"));
            admin.setStatus("활성");
            admin.setReg_date(LocalDate.now());
            userRepository.save(admin);
        }
    }
}
