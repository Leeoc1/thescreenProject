package com.example.thescreen.controller;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.entity.MovieView;
import com.example.thescreen.entity.MovieWithSchedule;
import com.example.thescreen.repository.MovieRepository;
import com.example.thescreen.repository.MovieViewRepository;
import com.example.thescreen.repository.MovieWIthScheduleRepository;
import com.example.thescreen.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000" })
public class MovieController {

    private final MovieRepository movieRepository;
    private final MovieViewRepository movieViewRepository;
    private final MovieService movieService;
    private final JdbcTemplate jdbcTemplate;
    // private final FetchMovieService fetchMovieService;
    private final MovieWIthScheduleRepository movieWIthScheduleRepository;

    /**
     * 애플리케이션 시작 시 자동으로 영화 순위 업데이트
     */
    @PostConstruct
    public void initializeMovieRanking() {
        try {
            updateMovieInfoForRankedMovies();
            System.out.println("영화 순위 자동 업데이트 완료");
        } catch (Exception e) {
            System.err.println("영화 순위 자동 업데이트 실패: " + e.getMessage());
        }
    }

    /**
     * ✅ 1) 모든 영화 조회 (상영 중인 영화만)
     */
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findByMovieinfo("Y");
    }

    /**
     * ✅ 2) 현재 상영작 조회 (스케줄이 있는 모든 영화 포함)
     */
    @GetMapping("/current")
    public List<MovieWithSchedule> getCurrentMovies() {
        LocalDate today = LocalDate.now();
        return movieWIthScheduleRepository.findCurrentScreeningMovies(today);
    }

    /**
     * ✅ 3) 상영 예정작 조회 (상영 중인 영화만)
     */
    @GetMapping("/upcoming")
    public List<MovieWithSchedule> getUpcomingMovies() {
        LocalDate today = LocalDate.now();
        // return movieRepository.findUpcomingScreeningMovies(today);
        return movieWIthScheduleRepository.findUpcomingScreeningMovies(today);
    }

    /**
     * ✅ 4) 관리자용 KOBIS 박스오피스 + 상세 정보 수동 저장
     */
    @PostMapping("/fetch-movies")
    public java.util.Map<String, Object> fetchMoviesFromKobis() {
        try {
            // 저장 전 영화 개수
            long beforeCount = movieRepository.count();

            movieService.saveDailyBoxOffice();

            // 저장 후 영화 개수
            long afterCount = movieRepository.count();
            long addedCount = afterCount - beforeCount;

            // movieview 테이블에서 movierank가 null이 아닌 영화들의 movieinfo를 Y로 업데이트
            updateMovieInfoForRankedMovies();

            // 저장 후 업데이트된 영화 목록을 반환
            LocalDate today = LocalDate.now();
            List<Movie> allMovies = movieRepository.findAll();

            // 현재 상영작: movieinfo가 'Y' 또는 'N인 영화들
            List<Movie> currentMovies = allMovies.stream()
                    .filter(movie -> "Y".equals(movie.getMovieinfo()) || "N".equals(movie.getMovieinfo()))
                    .collect(Collectors.toList());
            // 상영 종료작: movieinfo가 'D인 영화들
            List<Movie> archivedMovies = allMovies.stream()
                    .filter(movie -> "D".equals(movie.getMovieinfo()))
                    .collect(Collectors.toList());

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("message", String.format("박스오피스 데이터 처리 완료! 새로 추가된 영화: %d개 (전체: %d개)",
                    addedCount, afterCount));
            result.put("addedCount", addedCount);
            result.put("totalCount", afterCount);
            result.put("currentMovies", currentMovies);
            result.put("archivedMovies", archivedMovies);
            return result;
        } catch (Exception e) {
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", false);
            result.put("message", "데이터 가져오기에 실패했습니다: " + e.getMessage());
            return result;
        }
    }

    /**
     * movieview 테이블에서 movierank가 null이 아닌 영화들의 movieinfo를 Y로 업데이트
     */
    private void updateMovieInfoForRankedMovies() {
        try {
            // 1. 순위가 있는 영화
            List<MovieView> rankedMovies = movieViewRepository.findMoviesWithRank();
            for (MovieView movieView : rankedMovies) {
                Optional<Movie> movieOpt = movieRepository.findById(movieView.getMoviecd());
                if (movieOpt.isPresent()) {
                    Movie movie = movieOpt.get();
                    if (!"Y".equals(movie.getMovieinfo())) {
                        movie.setMovieinfo("Y");
                        movieRepository.save(movie);
                    }
                }
            }

            LocalDate today = LocalDate.now();
            LocalDate fiftyDaysAgo = today.minusDays(60);

            // 2. 오늘 이후 개봉 영화는 'E'로
            List<Movie> upcomingMovies = movieRepository.findByReleasedateAfter(today);
            for (Movie movie : upcomingMovies) {
                if (!"E".equals(movie.getMovieinfo())) {
                    movie.setMovieinfo("E");
                    movieRepository.save(movie);
                }
            }

            // 3. 오늘 개봉한 영화는 'N'으로
            List<Movie> todayMovies = movieRepository.findByReleasedate(today);
            for (Movie movie : todayMovies) {
                if (!"N".equals(movie.getMovieinfo())) {
                    movie.setMovieinfo("N");
                    movieRepository.save(movie);
                }
            }

            // 4. 오늘보다 50일 이전 ~ 어제까지 개봉한 영화는 'Y'로
            List<Movie> recentMovies = movieRepository.findByReleasedateBetween(fiftyDaysAgo, today.minusDays(1));
            for (Movie movie : recentMovies) {
                if (!"Y".equals(movie.getMovieinfo())) {
                    movie.setMovieinfo("Y");
                    movieRepository.save(movie);
                }
            }

            // 5. 50일보다 더 이전에 개봉한 영화는 'D'로
            List<Movie> oldMovies = movieRepository.findByReleasedateBefore(fiftyDaysAgo);
            for (Movie movie : oldMovies) {
                if (!"D".equals(movie.getMovieinfo())) {
                    movie.setMovieinfo("D");
                    movieRepository.save(movie);
                }
            }
        } catch (Exception e) {
            System.err.println("영화 순위/개봉일 업데이트 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * ✅ 5) 관리자용 영화 목록 조회 (현재 상영작 + 상영 종료작)
     */
    @GetMapping("/admin")
    public java.util.Map<String, List<Movie>> getMoviesForAdmin() {
        LocalDate today = LocalDate.now();
        List<Movie> allMovies = movieRepository.findAll();
        // 현재 상영작: movieinfo가 'Y', 'N', 'E'인 영화들
        List<Movie> currentMovies = allMovies.stream()
                .filter(movie -> "Y".equals(movie.getMovieinfo()) || "N".equals(movie.getMovieinfo())
                        || "E".equals(movie.getMovieinfo()))
                .collect(Collectors.toList());
        // 상영 종료작: movieinfo가 'D'인 영화들
        List<Movie> archivedMovies = allMovies.stream()
                .filter(movie -> "D".equals(movie.getMovieinfo()))
                .collect(Collectors.toList());

        java.util.Map<String, List<Movie>> result = new java.util.HashMap<>();
        result.put("currentMovies", currentMovies);
        result.put("archivedMovies", archivedMovies);

        return result;
    }

    /**
     * ✅ 6) 영화 정보 수정
     */
    @PutMapping("/{moviecd}")
    public Movie updateMovie(@PathVariable String moviecd, @RequestBody Movie updatedMovie) {
        Movie movie = movieRepository.findById(moviecd)
                .orElseThrow(() -> new RuntimeException("영화를 찾을 수 없습니다: " + moviecd));
        // 수정 가능한 필드들만 업데이트
        if (updatedMovie.getMovienm() != null) {
            movie.setMovienm(updatedMovie.getMovienm());
        }
        if (updatedMovie.getGenre() != null) {
            movie.setGenre(updatedMovie.getGenre());
        }
        if (updatedMovie.getRunningtime() != null) {
            movie.setRunningtime(updatedMovie.getRunningtime());
        }
        if (updatedMovie.getReleasedate() != null) {
            movie.setReleasedate(updatedMovie.getReleasedate());
        }
        if (updatedMovie.getDirector() != null) {
            movie.setDirector(updatedMovie.getDirector());
        }
        if (updatedMovie.getActors() != null) {
            movie.setActors(updatedMovie.getActors());
        }
        if (updatedMovie.getDescription() != null) {
            movie.setDescription(updatedMovie.getDescription());
        }
        if (updatedMovie.getIsadult() != null) {
            movie.setIsadult(updatedMovie.getIsadult());
        }
        return movieRepository.save(movie);
    }

    /**
     * ✅ 7) 영화 삭제
     */
    @DeleteMapping("/{moviecd}")
    public String deleteMovie(@PathVariable String moviecd) {
        if (!movieRepository.existsById(moviecd)) {
            throw new RuntimeException("영화를 찾을 수 없습니다: " + moviecd);
        }
        movieRepository.deleteById(moviecd);
        return "영화가 성공적으로 삭제되었습니다.";
    }

    /**
     * ✅ 8) 영화 상영 상태 변경
     */
    @PutMapping("/{moviecd}/screening-status")
    public Movie updateScreeningStatus(@PathVariable String moviecd) {
        Movie movie = movieRepository.findById(moviecd)
                .orElseThrow(() -> new RuntimeException("영화를 찾을 수 없습니다: " + moviecd));
        // 현재 상태의 반대로 변경
        String currentStatus = movie.getMovieinfo();
        String newStatus = "Y".equals(currentStatus) ? "N" : "Y";
        movie.setMovieinfo(newStatus);
        return movieRepository.save(movie);
    }

    /**
     * ✅ 9) 영화 상영 종료 (논리적 삭제)
     */
    @PutMapping("/{moviecd}/archive")
    public Movie archiveMovie(@PathVariable String moviecd) {
        Movie movie = movieRepository.findById(moviecd)
                .orElseThrow(() -> new RuntimeException("영화를 찾을 수 없습니다: " + moviecd));

        // 상영 종료 상태로 변경 (논리적 삭제)
        movie.setMovieinfo("D");

        return movieRepository.save(movie);
    }

    @PostMapping("/detail")
    public ResponseEntity<Map<String, Object>> getMovieDetail(@RequestBody Map<String, Object> params) {
        String moviecd = (String) params.get("movieno");
        Optional<Movie> movieOpt = movieRepository.findById(moviecd);

        Map<String, Object> response = new HashMap<>();

        if (movieOpt.isPresent()) {
            Movie movie = movieOpt.get();
            response.put("moviecd", movie.getMoviecd());
            response.put("movienm", movie.getMovienm());
            response.put("genre", movie.getGenre());
            response.put("director", movie.getDirector());
            response.put("actors", movie.getActors());
            response.put("description", movie.getDescription());
            response.put("posterurl", movie.getPosterurl());
            response.put("releasedate", movie.getReleasedate());
            response.put("runningtime", movie.getRunningtime());
            response.put("isadult", movie.getIsadult());
            response.put("movieinfo", movie.getMovieinfo());

            // 누적관객수와 영화 순위 정보 추가 (MovieRank 테이블에서 조회)
            try {
                String sql = "SELECT audiacc, movierank FROM movierank WHERE movierankcd = ?";
                Map<String, Object> rankData = jdbcTemplate.queryForMap(sql, moviecd);
                response.put("audiacc", rankData.get("audiacc"));
                response.put("movierank", rankData.get("movierank"));
            } catch (Exception e) {
                // MovieRank에 해당 영화가 없는 경우 기본값으로 설정
                response.put("audiacc", 0L);
                response.put("movierank", null);
            }
        }

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // 박스오피스 TOP 10 (순위 기반)
    @GetMapping("/top/ten")
    public List<MovieWithSchedule> getTopTenMovies() {
        // return movieViewRepository.findMoviesWithRank();
        // return movieScheduleRepository.findMoviesWithRank();
        return movieWIthScheduleRepository.findTop10MoviesWithRank();
    }
}
