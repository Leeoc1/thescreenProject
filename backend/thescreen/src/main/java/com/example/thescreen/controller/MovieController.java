package com.example.thescreen.controller;

import com.example.thescreen.entity.Movie;
import com.example.thescreen.entity.MovieView;
import com.example.thescreen.repository.MovieRepository;
import com.example.thescreen.repository.MovieViewRepository;
import com.example.thescreen.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * ✅ 1) 모든 영화 조회 (상영 중인 영화만) - 뷰 사용
     */
    @GetMapping
    public List<MovieView> getAllMovies() {
        return movieViewRepository.findByMovieinfo("Y");
    }

    /**
     * ✅ 2) 현재 상영작 조회 (상영중 상태 기준) - 뷰 사용
     */
    @GetMapping("/current")
    public List<MovieView> getCurrentMovies() {
        return movieViewRepository.findByMovieinfo("Y");
    }

    /**
     * ✅ 3) 상영 예정작 조회 - 뷰 사용
     */
    @GetMapping("/upcoming")
    public List<MovieView> getUpcomingMovies() {
        return movieViewRepository.findByMovieinfo("E");
    }

    /**
     * ✅ 4) 박스오피스 TOP 10 - 뷰 사용
     */
    @GetMapping("/top/ten")
    public List<MovieView> getTopTenMovies() {
        return movieViewRepository.findTop10ByMovierankIsNotNullOrderByMovierankAsc();
    }

    /**
     * ✅ 5) 영화 상세 정보 조회 - 뷰 사용
     */
    @PostMapping("/detail")
    public ResponseEntity<Map<String, Object>> getMovieDetail(@RequestBody Map<String, Object> params) {
        String moviecd = (String) params.get("movieno");
        Optional<MovieView> movieOpt = movieViewRepository.findById(moviecd);

        Map<String, Object> response = new HashMap<>();

        if (movieOpt.isPresent()) {
            MovieView movie = movieOpt.get();
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
            
            // 박스오피스 정보
            response.put("audiacc", movie.getAudiacc());
            response.put("movierank", movie.getMovierank());
        }

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * ✅ 6) 관리자용 영화 목록 조회 - 뷰 사용
     */
    @GetMapping("/admin")
    public Map<String, List<MovieView>> getMoviesForAdmin() {
        List<MovieView> allMovies = movieViewRepository.findAll();
        
        // 현재 상영작: movieinfo가 'Y', 'N', 'E'인 영화들
        List<MovieView> currentMovies = allMovies.stream()
                .filter(movie -> "Y".equals(movie.getMovieinfo()) || 
                               "N".equals(movie.getMovieinfo()) || 
                               "E".equals(movie.getMovieinfo()))
                .collect(Collectors.toList());
                
        // 상영 종료작: movieinfo가 'D'인 영화들
        List<MovieView> archivedMovies = allMovies.stream()
                .filter(movie -> "D".equals(movie.getMovieinfo()))
                .collect(Collectors.toList());

        Map<String, List<MovieView>> result = new HashMap<>();
        result.put("currentMovies", currentMovies);
        result.put("archivedMovies", archivedMovies);

        return result;
    }

    /**
     * ✅ 7) 현재 상영작 데이터 가져오기 (박스오피스 11~20위, 상영준비중 상태로 저장)
     */
    @PostMapping("/fetch-movies")
    public Map<String, Object> fetchMoviesFromKobis() {
        try {
            // 저장 전 영화 개수
            long beforeCount = movieRepository.count();

            List<Movie> readyMovies = movieService.saveBoxOfficeReadyMovies();

            // 저장 후 영화 개수
            long afterCount = movieRepository.count();
            long addedCount = afterCount - beforeCount;

            // 저장 후 업데이트된 영화 목록을 뷰에서 반환
            List<MovieView> allMovies = movieViewRepository.findAll();

            // 현재 상영작: movieinfo가 'Y', 'N', 'E'인 영화들
            List<MovieView> currentMovies = allMovies.stream()
                    .filter(movie -> "Y".equals(movie.getMovieinfo()) || 
                                   "N".equals(movie.getMovieinfo()) || 
                                   "E".equals(movie.getMovieinfo()))
                    .collect(Collectors.toList());
            // 상영 종료작: movieinfo가 'D'인 영화들
            List<MovieView> archivedMovies = allMovies.stream()
                    .filter(movie -> "D".equals(movie.getMovieinfo()))
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", String.format("영화 %d개가 상영 준비중으로 저장되었습니다. 상영시작 버튼을 누르면 상영이 시작됩니다.",
                    readyMovies.size()));
            result.put("addedCount", addedCount);
            result.put("totalCount", afterCount);
            result.put("currentMovies", currentMovies);
            result.put("archivedMovies", archivedMovies);
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "데이터 가져오기에 실패했습니다: " + e.getMessage());
            return result;
        }
    }

    /**
     * ✅ 8) 영화 정보 수정 (실제 테이블 업데이트, 뷰는 자동 반영)
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
     * ✅ 9) 영화 삭제 (실제 테이블에서 삭제, 뷰는 자동 반영)
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
     * ✅ 10) 영화 상영 상태 변경 (실제 테이블 업데이트, 뷰는 자동 반영)
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
     * ✅ 11) 영화 상영 종료 (논리적 삭제, 실제 테이블 업데이트)
     */
    @PutMapping("/{moviecd}/archive")
    public Movie archiveMovie(@PathVariable String moviecd) {
        Movie movie = movieRepository.findById(moviecd)
                .orElseThrow(() -> new RuntimeException("영화를 찾을 수 없습니다: " + moviecd));

        // 상영 종료 상태로 변경 (논리적 삭제)
        movie.setMovieinfo("D");

        return movieRepository.save(movie);
    }
}