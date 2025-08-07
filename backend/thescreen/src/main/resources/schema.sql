-- create schedule_view
create or replace view schedule_view as
select s.schedulecd, s.startdate, s.starttime, m.movienm, m.moviecd,
m.runningscreen, m.runningtime, m.director, m.description, m.actors, m.posterurl, m.releasedate,
m.genre, m.movieinfo, m.isadult, mr.movierank, mr.rankchange,
sc.screenname,sc.screenstatus, sc.screentype, sc.allseat,
sc.reservationseat, c.cinemanm, r.regionnm
from
    schedule s
    inner join movie m on s.moviecd = m.moviecd
    inner join screen sc on s.screencd = sc.screencd
    inner join cinema c on sc.cinemacd = c.cinemacd
    inner join region r on c.regioncd = r.regioncd
    inner join movierank mr on s.moviecd = mr.movierankcd;

-- create reservation_view
create or replace view reservation_view as
select r.reservationcd, r.seatcd, r.reservationtime, r.reservationstatus, sv.starttime, sv.movienm, sv.runningtime, sv.screenname, sv.cinemanm, r.userid, p.paymenttime, p.paymentmethod, p.amount
from
    reservation r
    inner join schedule_view sv on r.schedulecd = sv.schedulecd
    inner join payment p on r.paymentcd = p.paymentcd;

-- create screen_view
create or replace view screen_view as
select s.screencd, s.allseat, s.cinemacd, s.reservationseat, s.screenname, s.screenstatus, s.screentype, c.cinemanm, rg.regioncd, rg.regionnm
from
    screen s
    inner join cinema c on s.cinemacd = c.cinemacd
    inner join region rg on rg.regioncd = c.regioncd;

-- create movie_view
CREATE OR REPLACE VIEW view_movie_with_rank AS
SELECT m.moviecd, m.movienm, m.description, m.genre, m.director, m.actors, m.runningtime, m.releasedate, m.posterurl, m.runningscreen, m.movieinfo, m.isadult, r.movierankcd, r.movierank, r.rankchange
FROM movie m
    LEFT JOIN movierank r ON m.movienm = r.moviename;

-- create review_view
CREATE OR REPLACE VIEW review_view AS
SELECT r.reviewnum, -- 리뷰 번호
    u.userid, -- 유저 ID
    m.movienm, -- 영화 이름
    r.rating, -- 평점
    r.likes -- 추천(좋아요)
FROM review r
    LEFT JOIN users u ON r.userid = u.userid
    LEFT JOIN movie m ON r.moviecd = m.moviecd;

-- create moviewithschedule view (스케줄이 있는 영화)
CREATE OR REPLACE VIEW moviewithschedule AS
SELECT m.moviecd, m.movienm, m.description, m.genre, m.director, m.actors, m.runningtime, m.releasedate, m.posterurl, m.runningscreen, m.movieinfo, m.isadult, mr.movierank
FROM movie m
    LEFT JOIN movierank mr ON m.moviecd = mr.movierankcd
WHERE
    EXISTS (
        SELECT 1
        FROM schedule s
        WHERE
            s.moviecd = m.moviecd
    );