-- 완전한 데이터베이스 정리 스크립트
-- MariaDB에서 직접 실행하여 깨끗한 상태로 초기화

USE thescreen;

-- 1단계: 모든 뷰 삭제
DROP VIEW IF EXISTS reservation_view;
DROP VIEW IF EXISTS review_view;  
DROP VIEW IF EXISTS screen_view;
DROP VIEW IF EXISTS schedule_view;
DROP VIEW IF EXISTS boxoffice_movies_view;
DROP VIEW IF EXISTS view_movie_with_rank;
DROP VIEW IF EXISTS moviewithschedule;

-- 2단계: 혹시 테이블로 잘못 생성된 뷰들 삭제
DROP TABLE IF EXISTS reservation_view;
DROP TABLE IF EXISTS review_view;
DROP TABLE IF EXISTS screen_view;
DROP TABLE IF EXISTS schedule_view;
DROP TABLE IF EXISTS boxoffice_movies_view;
DROP TABLE IF EXISTS view_movie_with_rank;
DROP TABLE IF EXISTS moviewithschedule;

-- 3단계: 기존 테이블들 삭제
DROP TABLE IF EXISTS movierank;
DROP TABLE IF EXISTS boxoffice_movies_view;

-- 4단계: 외래키 제약조건이 있는 테이블들을 순서대로 삭제
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS payment; 
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS mycinema;
DROP TABLE IF EXISTS notice;
DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS screen;
DROP TABLE IF EXISTS cinema;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS coupon;
DROP TABLE IF EXISTS inquiry;
DROP TABLE IF EXISTS chatbot_vector;

-- 이제 Spring Boot 애플리케이션을 다시 시작하면 깨끗한 상태에서 초기화됩니다.
