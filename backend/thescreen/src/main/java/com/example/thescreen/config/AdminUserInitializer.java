package com.example.thescreen.config;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // master001 계정이 없으면 생성
        if (!userRepository.existsById("master001")) {
            User masterUser = new User();
            masterUser.setUserid("master001");
            masterUser.setUserpw(passwordEncoder.encode("pass_001")); // 여기서 직접 해시화
            masterUser.setUsername("김관리");
            masterUser.setEmail("master1@example.com");
            masterUser.setPhone("01011112222");
            masterUser.setBirth(LocalDate.of(1995, 5, 1));
            masterUser.setStatus("활성");
            masterUser.setReg_date(LocalDate.now());
            
            userRepository.save(masterUser);
            System.out.println("===관리자 계정 생성 완료===");
        } else {
            // 이미 존재하면 비밀번호만 업데이트 (혹시 해시가 잘못되었을 경우 대비)
            User existingUser = userRepository.findById("master001").orElse(null);
            if (existingUser != null) {
                String newHashedPassword = passwordEncoder.encode("pass_001");
                existingUser.setUserpw(newHashedPassword);
                userRepository.save(existingUser);
            }
        }
    }
}
