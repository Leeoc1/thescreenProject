package com.example.thescreen.service;

import com.example.thescreen.entity.WishList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.thescreen.repository.WishListRepository;

import com.example.thescreen.repository.MovieRepository;
import com.example.thescreen.entity.Movie;
import java.util.ArrayList;
import java.util.HashMap;

import java.util.List;
import java.util.Map;

@Service
public class WishListService {

    @Autowired
    private WishListRepository wishListRepository;

    @Autowired
    private MovieRepository movieRepository;

    // 영화별 찜 카운트 반환
    public int countByMoviecd(String moviecd) {
        return wishListRepository.countByMoviecdAndWishliststatusTrue(moviecd);
    }

    // 유저의 찜 여부 반환 (true/false)
    public boolean isWishedByUser(String userid, String moviecd) {
        return wishListRepository.existsByUseridAndMoviecdAndWishliststatusTrue(userid, moviecd);
    }

    // 찜 추가/해제 토글
    public boolean toggleWishlist(String userid, String moviecd) {
        // 기존 찜 데이터가 있는지 확인
            WishList existingWishlist = wishListRepository.findByUseridAndMoviecd(userid, moviecd);
        
        if (existingWishlist == null) {
            // 데이터가 없으면 새로 생성 (찜 추가)
            WishList newWishlist = new WishList(userid, moviecd, true);
            wishListRepository.save(newWishlist);
            return true;
        } else {
            // 데이터가 있으면 상태 토글
            existingWishlist.setWishliststatus(!existingWishlist.getWishliststatus());
            wishListRepository.save(existingWishlist);
            return existingWishlist.getWishliststatus();
        }
    }

    // 유저가 찜한 영화 목록 반환 (wishliststatus가 true인 것만)
    public List<WishList> findWishedMoviesByUser(String userid) {
        return wishListRepository.findByUseridAndWishliststatusTrue(userid);
    }

    // 유저가 찜한 영화의 상세 정보 리스트 반환
    public List<Map<String, Object>> findWishedMovieInfoByUser(String userid) {
        List<WishList> wishLists = wishListRepository.findByUseridAndWishliststatusTrue(userid);
        List<Map<String, Object>> result = new ArrayList<>();
        for (WishList wish : wishLists) {
            Movie movie = movieRepository.findByMoviecd(wish.getMoviecd());
            if (movie != null) {
                Map<String, Object> movieInfo = new HashMap<>();
                movieInfo.put("moviecd", movie.getMoviecd());
                movieInfo.put("movienm", movie.getMovienm());
                movieInfo.put("posterurl", movie.getPosterurl());
                result.add(movieInfo);
            }
        }
        return result;
    }
}
