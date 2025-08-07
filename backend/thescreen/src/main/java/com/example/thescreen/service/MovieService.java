package com.example.thescreen.service;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MovieRepository movieRepository;

    @Value("${kobis.api.key}")
    private String kobisApiKey;

    @Value("${kmdb.api.key}")
    private String kmdbApiKey;

    @Value("${kmdb.api.key}")
    private String apiKey2;

    // KMDB API에서 포스터 URL을 가져오는 메서드
    private String getPosterFromKmdb(String kobisTitle, String openDt) {
        try {
            String encodedTitle = java.net.URLEncoder.encode(kobisTitle, "UTF-8");
            String releaseYear = (openDt != null && openDt.length() >= 4) ? openDt.substring(0, 4) : "";

            String url = String.format(
                    "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&title=%s&releaseDts=%s&ServiceKey=%s",
                    encodedTitle, releaseYear, apiKey2
            );

            String kmdbResponse = restTemplate.getForObject(url, String.class);

            if (kmdbResponse != null) {
                JsonNode root = objectMapper.readTree(kmdbResponse);
                JsonNode dataArray = root.path("Data");

                if (dataArray.isArray() && dataArray.size() > 0) {
                    JsonNode results = dataArray.get(0).path("Result");

                    for (JsonNode movieNode : results) {
                        String kmdbTitle = movieNode.path("title").asText();

                        if (isSimilarTitle(kobisTitle, kmdbTitle)) {
                            JsonNode posters = movieNode.path("posters");
                            if (!posters.isMissingNode() && !posters.asText().isEmpty()) {
                                String posterUrl = posters.asText().split("\\|")[0];
                                return posterUrl;
                            }
                        }
                    }
                }
            }

            return null;

        } catch (Exception e) {
            System.err.println("포스터 검색 중 오류 (" + kobisTitle + "): " + e.getMessage());
            return null;
        }
    }

    // 제목 유사성 체크 메서드
    private boolean isSimilarTitle(String kobisTitle, String kmdbTitle) {
        if (kobisTitle == null || kmdbTitle == null) return false;

        // HTML 태그 제거
        String cleanKmdbTitle = kmdbTitle.replaceAll("<[^>]*>", "").trim();

        // 공백 제거 후 비교
        String cleanKobis = kobisTitle.replaceAll("\\s+", "");
        String cleanKmdb = cleanKmdbTitle.replaceAll("\\s+", "");

        // 완전 일치 또는 포함 관계 체크
        return cleanKobis.equals(cleanKmdb) ||
                cleanKmdb.contains(cleanKobis) ||
                cleanKobis.contains(cleanKmdb);
    }

    /**
     * KOBIS 박스오피스에서 현재 상영중인 영화 목록을 가져와 DB 저장 후 반환
     */
    @Transactional
    public List<Movie> saveDailyBoxOffice() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        String targetDt = yesterday.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        String kobisUrl = String.format(
                "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=%s&targetDt=%s",
                kobisApiKey, targetDt);
        
        List<Movie> savedMovies = new ArrayList<>();
        
        try {
            String response = restTemplate.getForObject(kobisUrl, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode dailyBoxOfficeList = root.path("boxOfficeResult").path("dailyBoxOfficeList");

            for (JsonNode boxOfficeItem : dailyBoxOfficeList) {
                String movieCd = boxOfficeItem.path("movieCd").asText();
                String movieNm = boxOfficeItem.path("movieNm").asText();
                int rank = boxOfficeItem.path("rank").asInt();

                // 이미 존재하는 영화는 랭킹만 업데이트
                if (movieRepository.existsById(movieCd)) {
                    Movie existingMovie = movieRepository.findById(movieCd).orElse(null);
                    if (existingMovie != null) {
                        existingMovie.setMovierank(rank);
                        existingMovie.setMovieinfo("Y");
                        // lastUpdated는 @PreUpdate에서 자동 설정됨
                        movieRepository.save(existingMovie);
                        savedMovies.add(existingMovie);
                    }
                    continue;
                }

                // 새로운 영화는 상세 정보와 함께 저장
                Movie movie = fetchMovieDetails(movieCd, movieNm, "Y");
                if (movie != null) {
                    movie.setMovierank(rank);
                    // lastUpdated는 @PrePersist에서 자동 설정됨
                    Movie savedMovie = movieRepository.save(movie);
                    savedMovies.add(savedMovie);
                }
            }
        } catch (Exception e) {
            System.err.println("박스오피스 데이터 처리 중 오류: " + e.getMessage());
        }
        
        return savedMovies;
    }

    /**
     * KOBIS에서 오늘 이후 개봉 예정인 영화 목록을 가져와 DB 저장 후 반환
     */
    @Transactional
    public List<Movie> saveUpcomingMovies() {
        LocalDate today = LocalDate.now();
        String openStartDt = "2025";
        String openEndDt = "2025";
        int itemPerPage = 100;
        int curPage = 1;
        int totalToFetch = 20;

        List<Movie> savedMovies = new ArrayList<>();
        int totalFetched = 0;

        while (totalFetched < totalToFetch && curPage <= 5) {
            String kobisUrl = String.format(
                    "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=%s&openStartDt=%s&openEndDt=%s&itemPerPage=%d&curPage=%d",
                    kobisApiKey, openStartDt, openEndDt, itemPerPage, curPage);

            try {
                String response = restTemplate.getForObject(kobisUrl, String.class);
                JsonNode root = objectMapper.readTree(response);
                JsonNode movieList = root.path("movieListResult").path("movieList");

                if (movieList.isEmpty())
                    break;

                for (JsonNode movieNode : movieList) {
                    if (totalFetched >= totalToFetch)
                        break;

                    String movieCd = movieNode.path("movieCd").asText();
                    String movieNm = movieNode.path("movieNm").asText();
                    String openDt = movieNode.path("openDt").asText();
                    LocalDate releaseDate = openDt.isBlank() ? null : parseReleaseDate(openDt);

                    // 오늘 이후 개봉 영화만 처리 (최소 3일 후부터)
                    if (releaseDate == null || releaseDate.isBefore(today.plusDays(3))) {
                        continue;
                    }

                    // 이미 존재하는 영화는 패스
                    if (movieRepository.existsById(movieCd)) {
                        Movie existingMovie = movieRepository.findById(movieCd).orElse(null);
                        if (existingMovie != null) {
                            existingMovie.setMovieinfo("E");
                            // lastUpdated는 @PreUpdate에서 자동 설정됨
                            Movie updatedMovie = movieRepository.save(existingMovie);
                            savedMovies.add(updatedMovie);
                            totalFetched++;
                        }
                        continue;
                    }

                    // 새로운 상영예정작 저장
                    Movie movie = fetchMovieDetails(movieCd, movieNm, "E");
                    if (movie != null) {
                        movie.setReleasedate(releaseDate);
                        // lastUpdated는 @PrePersist에서 자동 설정됨
                        Movie savedMovie = movieRepository.save(movie);
                        savedMovies.add(savedMovie);
                        totalFetched++;
                    }
                }

                curPage++;
            } catch (Exception e) {
                System.err.println("상영예정작 데이터 처리 중 오류 (페이지 " + curPage + "): " + e.getMessage());
                break;
            }
        }

        System.out.println("상영예정작 " + savedMovies.size() + "개 처리 완료");
        return savedMovies;
    }

    /**
     * KOBIS API에서 영화 상세 정보를 가져와 Movie 객체 생성
     */
    private Movie fetchMovieDetails(String movieCd, String movieNm, String movieInfo) {
        try {
            // KOBIS 상세 정보
            String kobisInfoUrl = String.format(
                    "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=%s&movieCd=%s",
                    kobisApiKey, movieCd);
            String kobisInfoResponse = restTemplate.getForObject(kobisInfoUrl, String.class);
            JsonNode movieInfoNode = objectMapper.readTree(kobisInfoResponse)
                    .path("movieInfoResult").path("movieInfo");

            String showTm = movieInfoNode.path("showTm").asText("");
            String actors = StreamSupport.stream(movieInfoNode.path("actors").spliterator(), false)
                    .map(a -> a.path("peopleNm").asText())
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.joining(", "));
            String directors = StreamSupport.stream(movieInfoNode.path("directors").spliterator(), false)
                    .map(d -> d.path("peopleNm").asText())
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.joining(", "));
            String genres = StreamSupport.stream(movieInfoNode.path("genres").spliterator(), false)
                    .map(g -> g.path("genreNm").asText())
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.joining(", "));
            String watchGradeNm = movieInfoNode.path("audits").elements().hasNext()
                    ? movieInfoNode.path("audits").elements().next().path("watchGradeNm").asText("")
                    : "";
            String isAdult = watchGradeNm.contains("청소년관람불가") ? "Y" : "N";

            // KMDb API에서 줄거리와 포스터 가져오기
            String description = null;
            String posterUrl = null;
            
            try {
                String kmdbUrl = String.format(
                        "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&ServiceKey=%s&query=%s",
                        kmdbApiKey, movieNm);

                String kmdbResponse = restTemplate.getForObject(kmdbUrl, String.class);
                JsonNode kmdbResult = objectMapper.readTree(kmdbResponse);
                JsonNode dataArray = kmdbResult.path("Data");
                
                if (dataArray.isArray() && dataArray.size() > 0) {
                    JsonNode results = dataArray.get(0).path("Result");
                    if (results.isArray() && results.size() > 0) {
                        JsonNode result = results.get(0);
                        
                        // 줄거리 추출
                        JsonNode plots = result.path("plots").path("plot");
                        if (plots.isArray() && plots.size() > 0) {
                            description = plots.get(0).path("plotText").asText(null);
                        }
                        
                        // 포스터 추출
                        posterUrl = result.path("posters").asText(null);
                        if (posterUrl != null && !posterUrl.isBlank()) {
                            posterUrl = posterUrl.split("\\|")[0].trim();
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("KMDB API 호출 실패 for " + movieNm + ": " + e.getMessage());
            }

            // 줄거리나 포스터가 없으면 건너뛰기
            if ((description == null || description.isBlank()) && 
                (posterUrl == null || posterUrl.isBlank())) {
                return null;
            }

            Movie movie = new Movie();
            movie.setMoviecd(movieCd);
            movie.setMovienm(movieNm);
            movie.setDescription(description != null ? description : "줄거리 준비중");
            movie.setGenre(genres);
            movie.setDirector(directors);
            movie.setActors(actors);
            movie.setRunningtime(showTm.isBlank() ? null : Integer.parseInt(showTm));
            movie.setPosterurl(posterUrl != null ? posterUrl : "/images/movie.jpg");
            movie.setIsadult(Movie.IsAdult.valueOf(isAdult));
            movie.setMovieinfo(movieInfo);
            // lastUpdated는 @PrePersist에서 자동 설정됨

            return movie;

        } catch (Exception e) {
            System.err.println("영화 상세 정보 가져오기 실패 for " + movieNm + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * 애플리케이션 시작 시 상영예정작 데이터 자동 로드
     */
    @PostConstruct
    public void initializeUpcomingMovies() {
        try {
            System.out.println("상영예정작 데이터 초기화 시작...");
            List<Movie> upcomingMovies = saveUpcomingMovies();
            System.out.println("상영예정작 " + upcomingMovies.size() + "개 로드 완료");
        } catch (Exception e) {
            System.err.println("상영예정작 초기화 중 오류: " + e.getMessage());
        }
    }

    /**
     * 모든 상영예정작의 lastUpdated를 현재 날짜로 강제 업데이트
     */
    @Transactional
    public void forceUpdateUpcomingMoviesLastUpdated() {
        List<Movie> upcomingMovies = movieRepository.findByMovieinfo("E");
        
        System.out.println("상영예정작 lastUpdated 업데이트: " + upcomingMovies.size() + "개");
        
        for (Movie movie : upcomingMovies) {
            // save()만 호출하면 @PreUpdate에서 자동으로 lastUpdated 설정됨
            movieRepository.save(movie);
        }
        
        System.out.println("상영예정작 lastUpdated 업데이트 완료");
    }

    /**
     * openDt를 yyyy-MM-dd 또는 yyyyMMdd 형식으로 파싱
     */
    private LocalDate parseReleaseDate(String openDt) {
        try {
            // yyyy-MM-dd 형식 시도
            return LocalDate.parse(openDt, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            // yyyyMMdd 형식 시도
            return LocalDate.parse(openDt, DateTimeFormatter.ofPattern("yyyyMMdd"));
        }
    }

    /**
     * openDt를 KMDb의 releaseDts 형식(yyyyMMdd)으로 변환
     */
    private String parseReleaseDateForKmdb(String openDt) {
        if (openDt.isBlank()) {
            return "";
        }
        LocalDate date = parseReleaseDate(openDt);
        return date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}