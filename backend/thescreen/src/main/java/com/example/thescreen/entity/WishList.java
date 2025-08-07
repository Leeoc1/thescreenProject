package com.example.thescreen.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "wishlist")
public class WishList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer wishlistnum;
    
    @Column(nullable = false, length = 20)
    private String userid;
    
    @Column(nullable = false)
    private String moviecd;
    
    @Column(nullable = false)
    private Boolean wishliststatus = true;
    
    // 기본 생성자
    public WishList() {}
    
    // 생성자
    public WishList(String userid, String moviecd, Boolean wishliststatus) {
        this.userid = userid;
        this.moviecd = moviecd;
        this.wishliststatus = wishliststatus;
    }
    
    // Getter and Setter
    public Integer getWishlistnum() {
        return wishlistnum;
    }
    
    public void setWishlistnum(Integer wishlistnum) {
        this.wishlistnum = wishlistnum;
    }
    
    public String getUserid() {
        return userid;
    }
    
    public void setUserid(String userid) {
        this.userid = userid;
    }
    
    public String getMoviecd() {
        return moviecd;
    }
    
    public void setMoviecd(String moviecd) {
        this.moviecd = moviecd;
    }
    
    public Boolean getWishliststatus() {
        return wishliststatus;
    }
    
    public void setWishliststatus(Boolean wishliststatus) {
        this.wishliststatus = wishliststatus;
    }
}
