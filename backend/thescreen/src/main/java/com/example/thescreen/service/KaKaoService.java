package com.example.thescreen.service;

import com.example.thescreen.entity.ReservationView;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.time.format.DateTimeFormatter;

@Service
public class KaKaoService {
    @Value("${kakao.client.id}")
    private String clientId;

    private final RestTemplate restTemplate = new RestTemplate();

    public String sendKakaoMessage(ReservationView reservationView, String accessToken) {
        String url = "https://kapi.kakao.com/v2/api/talk/memo/default/send";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "Bearer " + accessToken);

        // 기본 템플릿 객체 생성
        String templateObject = String.format(
                "{\"object_type\":\"text\"," +
                        "\"text\":\"[예매 완료]\\n" +
                        "영화 예약이 완료되었습니다!\\n" +
                        "즐거운 관람 되세요😊\\n\\n" +
                        "■ 예매 정보\\n" +
                        "- 영화 정보: %s\\n" +
                        "- 예약일시: %s\\n" +
                        "- 상영관: %s\\n" +
                        "- 결제금액: %s원\\n\"," +
                        "\"link\":{\"web_url\":\"http://localhost:3000\",\"mobile_web_url\":\"http://localhost:3000\"}}",
                escapeJsonString(reservationView.getMovienm()),
                escapeJsonString(reservationView.getReservationtime() != null
                        ? reservationView.getReservationtime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                        : ""),
                escapeJsonString(reservationView.getScreenname()),
                escapeJsonString(String.valueOf(reservationView.getAmount())));

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("template_object", templateObject);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            String response = restTemplate.postForObject(url, request, String.class);
            return "Message sent: " + response;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String escapeJsonString(String input) {
        if (input == null)
            return "";
        return input.replace("\"", "\\\"").replace("\n", "\\n");
    }
}