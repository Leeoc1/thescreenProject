-- 기존 뷰와 테이블을 안전하게 정리
DROP VIEW IF EXISTS reservation_view;
DROP VIEW IF EXISTS review_view;
DROP VIEW IF EXISTS screen_view;
DROP VIEW IF EXISTS schedule_view;
DROP VIEW IF EXISTS movie_view;

-- 혹시 schedule_view가 테이블로 존재할 경우를 대비해 테이블로도 삭제 시도
DROP TABLE IF EXISTS schedule_view;
DROP TABLE IF EXISTS reservation_view;
DROP TABLE IF EXISTS review_view;
DROP TABLE IF EXISTS screen_view;
DROP TABLE IF EXISTS movie_view;

-- schedule_view 생성 (스케줄과 영화 정보 통합 뷰)
CREATE VIEW schedule_view AS
SELECT s.schedulecd, s.startdate, s.starttime, m.movienm, m.moviecd,
       m.runningtime, m.director, m.description, m.actors, m.posterurl, m.releasedate,
       m.genre, m.movieinfo, m.isadult, m.movierank, m.audiacc,
       sc.screenname, sc.screenstatus, sc.screentype, sc.allseat,
       sc.reservationseat, c.cinemanm, r.regionnm
FROM schedule s
    INNER JOIN movie m ON s.moviecd = m.moviecd
    INNER JOIN screen sc ON s.screencd = sc.screencd
    INNER JOIN cinema c ON sc.cinemacd = c.cinemacd
    INNER JOIN region r ON c.regioncd = r.regioncd;

-- reservation_view 생성
CREATE VIEW reservation_view AS
SELECT r.reservationcd, r.seatcd, r.reservationtime, r.reservationstatus, 
       sv.starttime, sv.movienm, sv.runningtime, sv.screenname, sv.cinemanm, 
       r.userid, p.paymenttime, p.paymentmethod, p.amount
FROM reservation r
    INNER JOIN schedule_view sv ON r.schedulecd = sv.schedulecd
    INNER JOIN payment p ON r.paymentcd = p.paymentcd;

-- screen_view 생성
CREATE VIEW screen_view AS
SELECT s.screencd, s.allseat, s.cinemacd, s.reservationseat, s.screenname, 
       s.screenstatus, s.screentype, c.cinemanm, rg.regioncd, rg.regionnm
FROM screen s
    INNER JOIN cinema c ON s.cinemacd = c.cinemacd
    INNER JOIN region rg ON rg.regioncd = c.regioncd;

-- review_view 생성
CREATE VIEW review_view AS
SELECT r.reviewnum, u.userid, m.movienm, r.rating, r.likes 
FROM review r
    LEFT JOIN users u ON r.userid = u.userid
    LEFT JOIN movie m ON r.moviecd = m.moviecd;

-- movie_view 생성 (Movie 테이블과 동일한 구조)
CREATE VIEW movie_view AS
SELECT 
    moviecd,
    movienm,
    description,
    genre,
    director,
    actors,
    runningtime,
    releasedate,
    posterurl,
    movieinfo,
    isadult,
    movierank,
    audiacc,
    last_updated
FROM movie;