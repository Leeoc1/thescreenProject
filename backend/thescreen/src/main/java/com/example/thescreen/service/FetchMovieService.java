package com.example.thescreen.service;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;

@Service
public class FetchMovieService {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${kobis.api.key:}")
    private String kobisApiKey;

    @Value("${kmdb.api.key:}")
    private String kmdbApiKey;

    /**
     * MovieRank 테이블에 있는 영화들의 상세 정보를 가져와서 Movie 테이블에 저장
     */
    public void fetchMovieDetailsForBoxOffice() {
        try {
            // 환경변수에서 API 키 가져오기
            if (kobisApiKey == null || kobisApiKey.isEmpty()) {
                kobisApiKey = System.getenv("KOBIS_API_KEY");
            }
            if (kmdbApiKey == null || kmdbApiKey.isEmpty()) {
                kmdbApiKey = System.getenv("KMDB_API_KEY");
            }
            
            if (kobisApiKey == null) {
                System.out.println("KOBIS API 키가 설정되어 있지 않습니다.");
                return;
            }

            // Movie 테이블에서 박스오피스 순위가 있는 영화 정보 가져오기
            String query = "SELECT moviecd, movienm FROM movie WHERE movierank IS NOT NULL";
            List<Map<String, Object>> boxOfficeMovies = jdbcTemplate.queryForList(query);
            
            System.out.println(">>> Movie 테이블에서 " + boxOfficeMovies.size() + "개 박스오피스 영화 발견");

            for (Map<String, Object> movieData : boxOfficeMovies) {
                String movieCd = (String) movieData.get("moviecd");
                String movieName = (String) movieData.get("movienm");
                
                System.out.println(">>> 영화 정보 수집 중: " + movieName + " (코드: " + movieCd + ")");
                
                // 이미 상세 정보가 있는지 확인 (description이 기본값이 아닌 경우)
                try {
                    String checkQuery = "SELECT description FROM movie WHERE moviecd = ?";
                    String currentDescription = jdbcTemplate.queryForObject(checkQuery, String.class, movieCd);
                    if (currentDescription != null && !currentDescription.equals("줄거리 정보를 준비중입니다.")) {
                        System.out.println(">>> 이미 상세 정보가 있는 영화: " + movieName);
                        continue;
                    }
                } catch (Exception e) {
                    // 영화가 없거나 오류 시 계속 진행
                }
                
                // KOBIS API에서 상세 정보 가져와서 업데이트
                updateMovieDetails(movieCd, movieName);
            }
            
            System.out.println(">>> 박스오피스 영화 정보 수집 완료");
            
        } catch (Exception e) {
            System.out.println(">>> 영화 정보 수집 중 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateMovieDetails(String movieCd, String movieName) {
        try {
            // KOBIS 상세 정보 API
            String kobisUrl = String.format(
                "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=%s&movieCd=%s",
                kobisApiKey, movieCd
            );
            
            String response = restTemplate.getForObject(kobisUrl, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode movieInfo = root.path("movieInfoResult").path("movieInfo");
            
            if (movieInfo.isMissingNode()) {
                System.out.println(">>> KOBIS API에서 영화 정보를 찾을 수 없음: " + movieName);
                return;
            }
            
            // 기본 정보 추출
            String showTm = movieInfo.path("showTm").asText("");
            String openDt = movieInfo.path("openDt").asText("");
            
            // 줄거리 정보는 KOBIS에서 제공하지 않으므로 KMDB에서 가져옴
            String description = "줄거리 정보를 준비중입니다.";
            
            // KMDB API에서 포스터와 줄거리 정보 가져오기
            String[] kmdbData = fetchDataFromKMDB(movieName, openDt);
            String posterUrl = kmdbData[0];
            if (!kmdbData[1].equals("줄거리 정보를 준비중입니다.")) {
                description = kmdbData[1];
            }
            
            // 감독 정보
            StringBuilder directors = new StringBuilder();
            JsonNode directorsNode = movieInfo.path("directors");
            for (JsonNode director : directorsNode) {
                if (directors.length() > 0) directors.append(", ");
                directors.append(director.path("peopleNm").asText());
            }
            
            // 배우 정보
            StringBuilder actors = new StringBuilder();
            JsonNode actorsNode = movieInfo.path("actors");
            int actorCount = 0;
            for (JsonNode actor : actorsNode) {
                if (actorCount >= 5) break;
                if (actors.length() > 0) actors.append(", ");
                actors.append(actor.path("peopleNm").asText());
                actorCount++;
            }
            
            // 장르 정보
            StringBuilder genres = new StringBuilder();
            JsonNode genresNode = movieInfo.path("genres");
            for (JsonNode genre : genresNode) {
                if (genres.length() > 0) genres.append(", ");
                genres.append(genre.path("genreNm").asText());
            }
            
            // 관람등급 정보 (KOBIS API에서 audits 필드로 가져오기)
            String isAdult = "N"; // 기본값: 전체관람가
            JsonNode auditsNode = movieInfo.path("audits");
            for (JsonNode audit : auditsNode) {
                String auditNo = audit.path("auditNo").asText("");
                String watchGradeNm = audit.path("watchGradeNm").asText("");
                
                // 관람등급에 따른 처리
                if (watchGradeNm.contains("청소년관람불가") || watchGradeNm.contains("19세") || 
                    watchGradeNm.contains("제한상영가") || auditNo.contains("19")) {
                    isAdult = "Y";
                    break; // 19세 이상 등급이면 바로 중단
                }
                
                System.out.println("관람등급 정보: " + watchGradeNm + " (등급번호: " + auditNo + ")");
            }
            
            // Movie 테이블 업데이트 (isadult 필드 추가)
            jdbcTemplate.update(
                "UPDATE movie SET description = ?, genre = ?, director = ?, actors = ?, runningtime = ?, releasedate = ?, posterurl = ?, isadult = ? WHERE moviecd = ?",
                description,
                genres.toString().isEmpty() ? "장르 정보 없음" : genres.toString(),
                directors.toString().isEmpty() ? "감독 정보 없음" : directors.toString(),
                actors.toString().isEmpty() ? "출연진 정보 없음" : actors.toString(),
                showTm.isEmpty() ? 120 : Integer.parseInt(showTm),
                parseOpenDate(openDt),
                posterUrl,
                isAdult,
                movieCd
            );
            
            System.out.println(">>> 영화 정보 업데이트 완료: " + movieName);
            
        } catch (Exception e) {
            System.out.println(">>> KOBIS API 오류: " + e.getMessage());
        }
    }
    
    /**
     * KMDB API에서 포스터와 줄거리 정보를 가져오는 메서드
     * @return String[2] - [0]: 포스터URL, [1]: 줄거리
     */
    private String[] fetchDataFromKMDB(String movieName, String releaseYear) {
        String[] result = {"/images/logo_1.png", "줄거리 정보를 준비중입니다."};
        
        try {
            if (kmdbApiKey == null || kmdbApiKey.isEmpty()) {
                System.out.println("KMDB API 키가 설정되어 있지 않습니다. 기본값을 사용합니다.");
                return result;
            }
            
            // 개봉년도 추출 (YYYYMMDD -> YYYY)
            String year = "";
            if (releaseYear != null && releaseYear.length() >= 4) {
                year = releaseYear.substring(0, 4);
            }
            
            // KMDB API URL 구성
            String kmdbUrl = "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp"
                    + "?collection=kmdb_new2"
                    + "&ServiceKey=" + kmdbApiKey
                    + "&title=" + java.net.URLEncoder.encode(movieName, "UTF-8")
                    + "&releaseDts=" + year
                    + "&listCount=1";
            
            System.out.println("KMDB API 호출: " + movieName + " (" + year + ")");
            
            URL url = new URL(kmdbUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            
            InputStream is = conn.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);
            
            JsonNode data = root.path("Data");
            if (data.isArray() && data.size() > 0) {
                JsonNode resultNode = data.get(0).path("Result");
                if (resultNode.isArray() && resultNode.size() > 0) {
                    JsonNode movie = resultNode.get(0);
                    
                    // 포스터 정보
                    String posterArray = movie.path("posters").asText();
                    if (posterArray != null && !posterArray.isEmpty()) {
                        String[] posters = posterArray.split("\\|");
                        if (posters.length > 0 && !posters[0].isEmpty()) {
                            result[0] = posters[0];
                            System.out.println("포스터 URL 찾음: " + posters[0]);
                        }
                    }
                    
                    // 줄거리 정보 (올바른 JSON 구조로 수정)
                    JsonNode plotsNode = movie.path("plots");
                    if (!plotsNode.isMissingNode()) {
                        JsonNode plotArray = plotsNode.path("plot");
                        if (plotArray.isArray() && plotArray.size() > 0) {
                            String plotText = plotArray.get(0).path("plotText").asText("");
                            if (!plotText.isEmpty()) {
                                result[1] = plotText;
                                System.out.println("줄거리 찾음: " + plotText.substring(0, Math.min(50, plotText.length())) + "...");
                            }
                        }
                    }
                }
            }
            
            if (result[0].equals("/images/logo_1.png") && result[1].equals("줄거리 정보를 준비중입니다.")) {
                System.out.println("KMDB에서 영화 정보를 찾지 못했습니다: " + movieName);
            }
            
        } catch (Exception e) {
            System.out.println("KMDB API 오류: " + e.getMessage());
        }
        
        return result;
    }
    
    private java.time.LocalDate parseOpenDate(String openDt) {
        try {
            if (openDt == null || openDt.isEmpty()) {
                return java.time.LocalDate.now();
            }
            
            if (openDt.length() == 8) {
                return java.time.LocalDate.parse(openDt, java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            } else if (openDt.length() == 10) {
                return java.time.LocalDate.parse(openDt);
            }
            
            return java.time.LocalDate.now();
            
        } catch (Exception e) {
            return java.time.LocalDate.now();
        }
    }
}