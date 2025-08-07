package com.example.thescreen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // 설정 클래스
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) { // CORS 설정
        registry.addMapping("/**") // 모든 경로 허용
                .allowedOrigins("http://localhost:3000") // 리액트 도메인 (명시적 지정)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // HTTP 메서드 (OPTIONS 추가)
                .allowedHeaders("*") // Authorization(JWT), Content-Type 등 확장 대응
                .allowCredentials(true); // 추후 로그인 상태 유지(JWT, 세션)에 사용
    }
}
