package com.example.thescreen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class MovieRankService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        saveMovieRanksFromApi();
    }

    public void saveMovieRanksFromApi() {
        try {
            String kobisApiKey = System.getenv("KOBIS_API_KEY");
            if (kobisApiKey == null) {
                kobisApiKey = System.getProperty("KOBIS_API_KEY");
            }
            if (kobisApiKey == null) {
                throw new RuntimeException("KOBIS_API_KEY 환경변수가 설정되어 있지 않습니다.");
            }
            String targetDate = LocalDate.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String apiUrl = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json"
                    + "?key=" + kobisApiKey
                    + "&targetDt=" + targetDate;

            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            InputStream is = conn.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);

            JsonNode boxOfficeList = root.path("boxOfficeResult").path("dailyBoxOfficeList");

            // 기존 데이터 삭제 (선택)
            jdbcTemplate.update("DELETE FROM movierank");

            for (JsonNode movie : boxOfficeList) {
                String code = movie.get("movieCd").asText();         // PK
                String name = movie.get("movieNm").asText();         // 영화 제목
                int rank = movie.get("rank").asInt();                // 순위
                int rankInten = movie.get("rankInten").asInt();      // 전일 대비 순위 변화
                
                // 누적관객수 추가 (audiAcc 필드)
                long audiAcc = 0;
                if (movie.has("audiAcc") && !movie.get("audiAcc").isNull()) {
                    try {
                        audiAcc = Long.parseLong(movie.get("audiAcc").asText().replace(",", ""));
                    } catch (NumberFormatException e) {
                        System.out.println("누적관객수 파싱 오류: " + movie.get("audiAcc").asText());
                        audiAcc = 0;
                    }
                }

                jdbcTemplate.update(
                        "INSERT INTO movierank (movierankcd, moviename, movierank, rankchange, audiacc) VALUES (?, ?, ?, ?, ?)",
                        code, name, rank, rankInten, audiAcc
                );
            }

            System.out.println(">>> 박스오피스 랭킹 DB 저장 완료");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
