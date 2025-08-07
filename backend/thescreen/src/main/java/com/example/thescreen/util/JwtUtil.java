package com.example.thescreen.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
    // 고정된 시크릿 키 사용 (Base64 인코딩된 256비트 키)
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor("MyVerySecretKeyForJWTTokenSigningThatIsAtLeast256Bits".getBytes());
    private final long EXPIRATION = 24 * 60 * 60 * 1000; // 24시간

    // userid를 JWT 토큰으로 암호화
    public String encodeUserid(String userid) {
        if (userid == null || userid.trim().isEmpty()) {
            System.err.println("[JWT 토큰 생성 오류] userid가 null이거나 비어있음: " + userid);
            throw new IllegalArgumentException("userid가 null이거나 비어있습니다.");
        }
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION);
        
        try {
            String token = Jwts.builder()
                    .setSubject(userid)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(SECRET_KEY)
                    .compact();
                    
            System.out.println("[USERID 토큰화 성공] 원본: " + userid + " -> 토큰 길이: " + token.length());
            return token;
        } catch (Exception e) {
            System.err.println("[JWT 토큰 생성 실패] userid: " + userid + ", 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // JWT 토큰에서 실제 userid 추출
    public String decodeUserid(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(SECRET_KEY)
                    .build().parseClaimsJws(token).getBody();
            String userid = claims.getSubject();
            System.out.println("[USERID 디코딩] 토큰: " + token + " -> 원본: " + userid);
            return userid;
        } catch (ExpiredJwtException e) {
            System.out.println("[JWT 토큰 만료] " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.out.println("[JWT 토큰 디코딩 실패] " + e.getMessage());
            return null;
        }
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("[JWT 토큰 만료] " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.out.println("[JWT 토큰 검증 실패] " + e.getMessage());
            return false;
        }
    }
    
    // 관리자용 토큰 생성 (기존 기능 유지)
    public String generateAdminToken(String userid) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 30 * 60 * 1000); // 30분
        
        String token = Jwts.builder()
                .setSubject(userid)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("type", "admin")
                .signWith(SECRET_KEY)
                .compact();
                
        System.out.println("[JWT 토큰 생성] 만료시간: " + expiryDate + " | 토큰 길이: " + token.length());
        return token;
    }
}
