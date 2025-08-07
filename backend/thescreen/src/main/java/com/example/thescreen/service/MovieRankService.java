package com.example.thescreen.service;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MovieRankService {

    @Autowired
    private FetchMovieService fetchMovieService;
    
    @Autowired
    private MovieRepository movieRepository;

    @PostConstruct
    public void init() {
        saveMovieRanksFromApi();
    }

    // 매일 오전 9시에 박스오피스 정보 업데이트
    @Scheduled(cron = "0 0 9 * * ?")
    public void updateBoxOfficeDaily() {
        System.out.println(">>> 매일 정기 박스오피스 업데이트 시작: " + LocalDate.now());
        saveMovieRanksFromApi();
    }

    // 매 6시간마다 박스오피스 정보 업데이트 (선택사항)
    // @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6시간마다
    public void updateBoxOfficePeriodically() {
        System.out.println(">>> 정기 박스오피스 업데이트 시작: " + LocalDate.now());
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

            // 기존 박스오피스 정보 초기화 (JPA 방식)
            List<Movie> allMovies = movieRepository.findAll();
            for (Movie movie : allMovies) {
                movie.setMovierank(null);
                movie.setAudiacc(null);
                movieRepository.save(movie); // @PreUpdate에서 lastUpdated 자동 설정
            }

            for (JsonNode movie : boxOfficeList) {
                String code = movie.get("movieCd").asText();
                String name = movie.get("movieNm").asText();
                int rank = movie.get("rank").asInt();
                
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

                // Movie 테이블에 박스오피스 정보 업데이트 (JPA 방식)
                Movie existingMovie = movieRepository.findById(code).orElse(null);
                if (existingMovie != null) {
                    // 기존 영화 업데이트
                    existingMovie.setMovierank(rank);
                    existingMovie.setAudiacc(audiAcc);
                    movieRepository.save(existingMovie); // @PreUpdate에서 lastUpdated 자동 설정
                } else {
                    // 새로운 영화 생성
                    Movie newMovie = new Movie();
                    newMovie.setMoviecd(code);
                    newMovie.setMovienm(name);
                    newMovie.setMovierank(rank);
                    newMovie.setAudiacc(audiAcc);
                    newMovie.setDescription("줄거리 정보를 준비중입니다.");
                    newMovie.setGenre("장르 정보 없음");
                    newMovie.setDirector("감독 정보 없음");
                    newMovie.setActors("출연진 정보 없음");
                    newMovie.setPosterurl("/images/logo_1.png");
                    newMovie.setMovieinfo("N");
                    newMovie.setIsadult(Movie.IsAdult.N);
                    movieRepository.save(newMovie); // @PrePersist에서 lastUpdated 자동 설정
                }
            }

            System.out.println(">>> 박스오피스 랭킹 DB 저장 완료");
            
            // 박스오피스 영화들의 상세 정보 가져오기
            System.out.println(">>> 박스오피스 영화 상세 정보 수집 시작");
            fetchMovieService.fetchMovieDetailsForBoxOffice();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
