package com.example.thescreen.controller;

import com.example.thescreen.entity.MovieRank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/movierank")
public class MovieRankController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<MovieRank> getAll() {
        String sql = "SELECT * FROM movierank ORDER BY movierank ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapToEntity(rs));
    }

    @GetMapping("/{code}")
    public MovieRank getByCode(@PathVariable String code) {
        String sql = "SELECT * FROM movierank WHERE movierankcd = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{code}, (rs, rowNum) -> mapToEntity(rs));
    }

    private MovieRank mapToEntity(ResultSet rs) throws SQLException {
        MovieRank rank = new MovieRank();
        rank.setMovierankcd(rs.getString("movierankcd"));
        rank.setMoviename(rs.getString("moviename"));
        rank.setMovierank(rs.getInt("movierank"));
        rank.setRankchange(rs.getInt("rankchange"));
        rank.setAudiacc(rs.getLong("audiacc")); // 누적관객수 추가
        return rank;
    }
}
