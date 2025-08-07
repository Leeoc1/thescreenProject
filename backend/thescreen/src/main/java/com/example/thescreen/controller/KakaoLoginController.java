package com.example.thescreen.controller;

import com.example.thescreen.entity.ReservationView;
import com.example.thescreen.entity.User;
import com.example.thescreen.repository.ReservationViewRepository;
import com.example.thescreen.repository.UserRepository;
import com.example.thescreen.service.KaKaoService;
import com.example.thescreen.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/login")
public class KakaoLoginController {
    @Autowired
    private KaKaoService kaKaoService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Value("${kakao.client.id}")
    private String clientId;

    @Value("${kakao.client.secret}")
    private String clientSecret;

    @Value("${kakao.redirect.uri}")
    private String redirectUri;

    private final UserRepository userRepository;
    private final ReservationViewRepository reservationViewRepository;
    private final Map<String, String> userAccessTokens = new HashMap<>();

    public KakaoLoginController(UserRepository userRepository, ReservationViewRepository reservationViewRepository) {
        this.userRepository = userRepository;
        this.reservationViewRepository = reservationViewRepository;
    }

    @PostMapping("/kakao")
    public Map<String, String> kakaoLogin(@RequestParam(value = "prompt", required = false) String prompt,
            @RequestParam(value = "scope", required = false) String scope) {
        String scopeParam = (scope != null) ? scope : "profile_nickname,talk_message";
        String authorizationUrl = "https://kauth.kakao.com/oauth/authorize?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&scope=" + scopeParam;
        if (prompt != null) {
            authorizationUrl += "&prompt=" + prompt;
        }
        Map<String, String> response = new HashMap<>();
        response.put("redirectUrl", authorizationUrl);
        return response;
    }

    @GetMapping("/oauth2/code/kakao")
    public ResponseEntity<?> kakaoCallback(@RequestParam("code") String code) {
        try {
            // 1. 인가 코드로 토큰 요청
            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = "https://kauth.kakao.com/oauth/token";
            MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
            tokenParams.add("grant_type", "authorization_code");
            tokenParams.add("client_id", clientId);
            tokenParams.add("client_secret", clientSecret);
            tokenParams.add("redirect_uri", redirectUri);
            tokenParams.add("code", code);

            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(tokenParams, tokenHeaders);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);
            Map<String, Object> tokenData = tokenResponse.getBody();
            String accessToken = (String) tokenData.get("access_token");

            // 2. 토큰으로 사용자 정보 요청
            String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userInfoRequest = new HttpEntity<>(userInfoHeaders);

            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userInfoRequest,
                    Map.class);
            Map<String, Object> userInfo = userInfoResponse.getBody();

            // 3. 사용자 정보 처리
            String userId = String.valueOf(userInfo.get("id"));
            String nickname = (String) ((Map<?, ?>) userInfo.get("properties")).get("nickname");
            // 액세스 토큰 저장

            userAccessTokens.put(userId, accessToken);

            // 4. 데이터베이스 확인
            if (userRepository.existsByUserid(userId)) {
                // 기존 사용자: 로그인 처리
                // JWT 토큰으로 userid 암호화
                String tokenizedUserid = jwtUtil.encodeUserid(userId);
                
                HttpHeaders headers = new HttpHeaders();
                String encodedNickname = URLEncoder.encode(nickname, StandardCharsets.UTF_8);
                String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
                headers.add("Location", "http://localhost:3000/login?kakao_login=success&userid=" + tokenizedUserid
                        + "&username=" + encodedNickname + "&access_token=" + encodedAccessToken);
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            } else {
                // 신규 사용자: 회원가입 처리
                return registerUser(userId, nickname, accessToken);
            }
        } catch (HttpClientErrorException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "카카오 로그인 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    private ResponseEntity<?> registerUser(String userId, String nickname, String accessToken) {
        // 신규 사용자 등록
        User newUser = new User();
        newUser.setUserid(userId);
        newUser.setUsername(nickname);
        newUser.setEmail(null);
        newUser.setUserpw(null);
        newUser.setPhone(null);
        newUser.setBirth(null);
        newUser.setStatus("활성");
        newUser.setReg_date(LocalDate.now());
        userRepository.save(newUser);

        // 신규 사용자의 액세스 토큰도 저장
        userAccessTokens.put(userId, accessToken);
        System.out.println("신규 사용자 액세스 토큰 저장: " + userId);

        // JWT 토큰으로 userid 암호화
        String tokenizedUserid = jwtUtil.encodeUserid(userId);
        String encodingName = URLEncoder.encode(nickname, StandardCharsets.UTF_8);
        String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        // 홈페이지로 리다이렉트 (JWT 토큰화된 사용자 정보 포함)
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location",
                "http://localhost:3000/login?kakao_login=success&userid=" + tokenizedUserid + "&username=" + encodingName
                        + "&access_token=" + encodedAccessToken);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    // 카카오 메시지 템플릿
    @PostMapping("api/send-reservation-message")
    public ResponseEntity<String> sendReservationMessage(@RequestBody Map<String, Object> request) {
        System.out.println("=== 카카오 메시지 전송 요청 ===");
        System.out.println("Request: " + request);

        try {
            // 요청 데이터 검증
            if (request == null || request.get("reservationId") == null) {
                System.out.println("ERROR: reservationId가 없습니다.");
                return ResponseEntity.badRequest().body("reservationId가 필요합니다.");
            }

            String reservationId = request.get("reservationId").toString();
            System.out.println("예약 ID: " + reservationId);

            // 액세스 토큰을 요청에서 가져오기 (우선순위 1)
            String accessToken = (String) request.get("accessToken");
            
            // 만약 accessToken이 없으면 userid로 저장된 토큰에서 찾기 (백업 방법)
            if (accessToken == null || accessToken.trim().isEmpty()) {
                String userid = (String) request.get("userid");
                if (userid != null) {
                    // JWT 토큰인 경우 디코딩해서 실제 userid 추출
                    String realUserid = userid;
                    try {
                        String decoded = jwtUtil.decodeUserid(userid);
                        if (decoded != null) {
                            realUserid = decoded;
                            System.out.println("JWT 토큰 디코딩: " + userid + " -> " + realUserid);
                        }
                    } catch (Exception e) {
                        System.out.println("JWT 디코딩 실패, 원본 userid 사용: " + userid);
                    }
                    
                    accessToken = userAccessTokens.get(realUserid);
                    if (accessToken != null) {
                        System.out.println("저장된 액세스 토큰에서 찾음: " + realUserid);
                    }
                }
            }
            
            if (accessToken == null || accessToken.trim().isEmpty()) {
                System.out.println("ERROR: 액세스 토큰을 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body("카카오 로그인이 필요합니다. 액세스 토큰이 없습니다.");
            }

            // ReservationView 조회
            Optional<ReservationView> reservationOpt = reservationViewRepository.findById(reservationId);
            if (!reservationOpt.isPresent()) {
                System.out.println("ERROR: 예약 정보를 찾을 수 없습니다. ID: " + reservationId);
                return ResponseEntity.badRequest().body("예약 정보를 찾을 수 없습니다.");
            }

            ReservationView reservationView = reservationOpt.get();
            System.out.println("액세스 토큰 찾음: " + accessToken.substring(0, 10) + "...");

            String result = kaKaoService.sendKakaoMessage(reservationView, accessToken);
            System.out.println("메시지 전송 결과: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("ERROR: 메시지 전송 실패");
            e.printStackTrace();
            return ResponseEntity.badRequest().body("메시지 전송 실패: " + e.getMessage());
        }
    }
}