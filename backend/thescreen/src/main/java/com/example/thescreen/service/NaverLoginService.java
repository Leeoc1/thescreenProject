package com.example.thescreen.service;

import com.example.thescreen.entity.User;
import com.example.thescreen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NaverLoginService {

    private final UserRepository userRepository;

    @Value("${naver.client.id}")
    private String NAVER_CLIENT_ID;

    @Value("${naver.client.secret}")
    private String NAVER_CLIENT_SECRET;

    @Value("${naver.redirect.url}")
    private String NAVER_REDIRECT_URL;

    private final static String NAVER_AUTH_URI = "https://nid.naver.com";
    private final static String NAVER_API_URI = "https://openapi.naver.com";

    public String getNaverLogin() {
        try {
            String state = generateState();
            String encodedRedirectUri = URLEncoder.encode(NAVER_REDIRECT_URL, StandardCharsets.UTF_8);

            String loginUrl = NAVER_AUTH_URI + "/oauth2.0/authorize"
                    + "?client_id=" + NAVER_CLIENT_ID
                    + "&redirect_uri=" + encodedRedirectUri
                    + "&response_type=code"
                    + "&state=" + state;

            return loginUrl;
        } catch (Exception e) {
            System.err.println("Error generating Naver login URL: " + e.getMessage());
            throw e;
        }
    }

    public Map<String, Object> getNaverToken(String code, String state) throws Exception {
        String tokenUrl = NAVER_AUTH_URI + "/oauth2.0/token";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", NAVER_CLIENT_ID);
        params.add("client_secret", NAVER_CLIENT_SECRET);
        params.add("code", code);
        params.add("state", state);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        return response.getBody();
    }

    public Map<String, Object> getNaverUserInfo(String accessToken) throws Exception {
        String userInfoUrl = NAVER_API_URI + "/v1/nid/me";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, Map.class);
        Map<String, Object> responseBody = response.getBody();

        return (Map<String, Object>) responseBody.get("response");
    }

    public User createNaverUser(Map<String, Object> userInfo) {
        String naverId = (String) userInfo.get("id");
        String name = (String) userInfo.get("name");
        String email = (String) userInfo.get("email");
        String mobile = (String) userInfo.get("mobile");
        String birthyear = (String) userInfo.get("birthyear");
        String birthday = (String) userInfo.get("birthday");

        LocalDate birth = null;
        if (birthyear != null && birthday != null) {
            try {
                birth = LocalDate.parse(birthyear + "-" + birthday, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            } catch (Exception e) {
                System.out.println("생년월일 파싱 오류: " + e.getMessage());

            }
        }

        // 20자까지만 자르기
        if (naverId != null && naverId.length() > 20) {
            naverId = naverId.substring(0, 20);
        }

        // 전화번호에서 하이픈과 공백 제거 (숫자만 남김)
        if (mobile != null) {
            mobile = mobile.replaceAll("[^0-9]", "");
        }

        User user = new User();
        user.setUserid(naverId);
        user.setUsername(name);
        user.setEmail(email);
        user.setPhone(mobile);
        user.setBirth(birth);
        user.setStatus("활성");
        user.setReg_date(LocalDate.now());

        // 저장 직전 값 출력
        System.out.println("=== 네이버 회원 저장 직전 값 ===");
        System.out.println("userid: " + user.getUserid());
        System.out.println("username: " + user.getUsername());
        System.out.println("email: " + user.getEmail());
        System.out.println("phone: " + user.getPhone());
        System.out.println("birth: " + user.getBirth());
        System.out.println("status: " + user.getStatus());
        System.out.println("reg_date: " + user.getReg_date());

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            System.out.println("DB 저장 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String generateState() {
        return UUID.randomUUID().toString();
    }
}