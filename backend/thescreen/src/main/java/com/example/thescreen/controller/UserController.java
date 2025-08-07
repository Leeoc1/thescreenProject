package com.example.thescreen.controller;

import com.example.thescreen.entity.ReservationView;
import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import com.example.thescreen.repository.ReservationViewRepository;
import com.example.thescreen.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationViewRepository reservationViewRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/list")
    public List<User> getUsersApi() {
        return userRepository.findAll();
    }

    // 사용자별 예약 정보 조회 API 추가
    @GetMapping("/{userid}/reservations")
    public ResponseEntity<?> getUserReservations(@PathVariable String userid) {
        try {
            List<ReservationView> reservations = reservationViewRepository.findByUseridOrderByReservationtimeDesc(userid);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            System.err.println("사용자 예약 정보 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody Map<String, Object> userData) {
        try {
            User user = new User();
            user.setUserid((String) userData.get("userid"));
            // 비밀번호 해시 적용
            user.setUserpw(passwordEncoder.encode((String) userData.get("userpw")));
            user.setUsername((String) userData.get("username"));
            user.setEmail((String) userData.get("email"));
            user.setPhone((String) userData.get("phone"));
            user.setReg_date(LocalDate.now());
            user.setStatus("활성");

            // 생년월일 처리
            if (userData.get("birth") != null) {
                String birthStr = (String) userData.get("birth");
                user.setBirth(LocalDate.parse(birthStr));
            }

            // 이미 존재하는 사용자인지 확인
            if (userRepository.existsById(user.getUserid())) {
                // 기존 사용자 정보 업데이트
                User existingUser = userRepository.findById(user.getUserid()).orElse(null);
                if (existingUser != null) {
                    existingUser.setUsername(user.getUsername());
                    existingUser.setEmail(user.getEmail());
                    existingUser.setPhone(user.getPhone());
                    if (user.getBirth() != null) {
                        existingUser.setBirth(user.getBirth());
                    }
                    return userRepository.save(existingUser);
                }
            }
            
            // 새 사용자 등록
            User savedUser = userRepository.save(user);
            
            // 회원가입 성공 시 환영 쿠폰 발급
            couponService.issueWelcomeCoupon(savedUser.getUserid());
            
            return savedUser;
        } catch (Exception e) {
            System.err.println("사용자 등록 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/info/{userid}")
    public ResponseEntity<User> getUserInfo(@PathVariable String userid) {
        try {
            User user = userRepository.findById(userid).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("사용자 정보 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/idcheck")
    public ResponseEntity<Map<String, Boolean>> checkUserIdAvailability(@RequestBody Map<String, String> request) {
        try {
            String userid = request.get("userid");
            boolean exists = userRepository.existsById(userid);
            Map<String, Boolean> response = Map.of("available", !exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("아이디 중복 확인 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 회원탈퇴 API - 상태를 '탈퇴'로 변경
    @DeleteMapping("/{userid}")
    public ResponseEntity<Map<String, String>> withdrawUser(@PathVariable String userid) {
        try {
            System.out.println("회원탈퇴 요청 받음 - userid: " + userid);
            User user = userRepository.findById(userid).orElse(null);
            if (user != null) {
                // 실제 삭제 대신 상태를 '탈퇴'로 변경
                user.setStatus("탈퇴");
                userRepository.save(user);
                System.out.println("회원탈퇴 완료 - userid: " + userid);
                return ResponseEntity.ok(Map.of("message", "회원탈퇴가 완료되었습니다."));
            } else {
                System.out.println("사용자를 찾을 수 없음 - userid: " + userid);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("회원탈퇴 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "회원탈퇴 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/pwcheck")
    public ResponseEntity<Map<String, Object>> checkUserpw(@RequestBody Map<String, String> request) {
        try {
            String userid = request.get("userid");
            String userpw = request.get("userpw");

            // 사용자 조회
            User user = userRepository.findById(userid).orElse(null);

            if (user != null) {
                // 사용자가 존재하는 경우, 비밀번호 해시 비교
                if (passwordEncoder.matches(userpw, user.getUserpw())) {
                    // 비밀번호가 일치하는 경우
                    return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 일치합니다."));
                } else  {
                    // 비밀번호가 일치하지 않는 경우
                    return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "비밀번호가 일치하지 않습니다."
                    ));
                }
            } else {
                // 사용자가 존재하지 않는 경우
                return ResponseEntity.ok(Map.of("success", false, "message", "존재하지 않는 사용자입니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "비밀번호 확인 중 오류가 발생했습니다."));    
        }
    }

    @PutMapping ("/{userid}/update/password")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody Map<String, String> request) {
        try {
            String userid = request.get("userid");
            String userpw = request.get("userpw");

            // 사용자 조회
            User user = userRepository.findById(userid).orElse(null);

            if (user != null) {
                user.setUserpw(passwordEncoder.encode(userpw));
                userRepository.save(user); // 데이터베이스에 저장
                return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 변경되었습니다."));
            } else {
                // 사용자가 존재하지 않는 경우
                return ResponseEntity.ok(Map.of("success", false, "message", "존재하지 않는 사용자입니다."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "비밀번호 변경 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/{userid}/update/userinfo")
    public ResponseEntity<Map<String, Object>> updateUserinfo(
            @PathVariable String userid,
            @RequestBody Map<String, String> request) {
        try {
            System.out.println("개인정보 수정 요청 - userid: " + userid);
            System.out.println("요청 데이터: " + request);
            
            // 사용자 조회
            User user = userRepository.findById(userid).orElse(null);

            if (user != null) {
                System.out.println("사용자 찾음: " + user.getUserid());
                String username = request.get("username");
                String email = request.get("email");
                String phone = request.get("phone");
                
                System.out.println("받은 데이터 - username: " + username + ", email: " + email + ", phone: " + phone);

                // null 체크 후 설정
                if (username != null && email != null && phone != null) {
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setPhone(phone);

                    userRepository.save(user); // 데이터베이스에 저장
                    System.out.println("사용자 정보 업데이트 완료");
                    return ResponseEntity.ok(Map.of("success", true, "message", "사용자 정보가 업데이트되었습니다."));
                } else {
                    System.out.println("필드 누락 - username: " + username + ", email: " + email + ", phone: " + phone);
                    return ResponseEntity.ok(Map.of("success", false, "message", "모든 필드를 입력해야 합니다."));
                }
            } else {
                System.out.println("사용자를 찾을 수 없음 - userid: " + userid);
                return ResponseEntity.ok(Map.of("success", false, "message", "존재하지 않는 사용자입니다."));
            }
        } catch (Exception e) {
            System.err.println("개인정보 수정 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "사용자 정보 업데이트 중 오류가 발생했습니다."));
        }
    }
}
