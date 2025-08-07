-- Notice 가데이터 생성
INSERT IGNORE INTO notice (noticenum, noticetype, noticesub, noticedate, noticecontents, writer) VALUES
  (1, '공지', '시스템 점검 안내', '2025-07-01 10:00:00', '시스템 점검 일정 안내입니다.', 'admin'),
  (2, '공지', '이용약관 개정', '2025-07-02 09:30:00', '이용약관이 변경되었습니다.', 'admin'),
  (3, '이벤트', '여름 할인 이벤트', '2025-07-03 14:00:00', '여름 시즌 할인 이벤트!', 'event_manager'),
  (4, '이벤트', '신규 회원 이벤트', '2025-07-04 15:00:00', '신규 가입 시 쿠폰 증정!', 'event_manager'),
  (5, '문의', '예매 취소 문의', '2025-07-05 11:20:00', '예매 취소 방법?', 'user01'),
  (6, '문의', '포인트 문의', '2025-07-05 13:40:00', '포인트 확인 방법?', 'user02'),
  (7, '문의', '좌석 오류 문의', '2025-07-06 16:00:00', '좌석 선택이 안됩니다.', 'user03'),
  (8, '문의', '결제 오류 문의', '2025-07-06 17:30:00', '결제 오류 발생.', 'user04'),
  (9, '문의', '로그인 문제 문의', '2025-07-07 09:10:00', '로그인 안됩니다.', 'user05'),
  (10, '점검', '정기 점검 안내', '2025-07-08 00:00:00', '정기 점검 예정.', 'admin'),
  (11, '점검', '긴급 점검 공지', '2025-07-08 02:30:00', '긴급 점검 안내.', 'admin'),
  (12, '공지', '상영시간 변경 안내', '2025-07-09 10:00:00', '영화 상영시간 변경.', 'admin'),
  (13, '공지', '서비스 정책 변경', '2025-07-09 11:00:00', '정책 일부 변경.', 'admin'),
  (14, '공지', '회원 혜택 안내', '2025-07-10 09:30:00', '등급별 혜택 안내.', 'admin'),
  (15, '공지', '앱 업데이트 공지', '2025-07-10 14:00:00', '앱을 최신 버전으로 업데이트.', 'admin');

-- FAQ 가데이터 생성
INSERT IGNORE INTO faq (faqnum, faqsub, faqdate, faqcontents) VALUES
    (1, '회원가입은 어떻게 하나요?', '2025-07-01 09:00:00', '홈페이지에서 가입할 수 있습니다.'),
    (2, '비밀번호를 잊어버렸어요.', '2025-07-01 10:00:00', '비밀번호 찾기 기능을 이용하세요.'),
    (3, '예매한 영화는 어디서 확인하나요?', '2025-07-02 11:00:00', '마이페이지 > 예매내역에서 확인하세요.'),
    (4, '예매 취소는 어떻게 하나요?', '2025-07-02 12:30:00', '마이페이지에서 예매 취소 가능합니다.'),
    (5, '포인트 적립은 어떻게 되나요?', '2025-07-03 13:00:00', '결제 시 포인트가 적립됩니다.'),
    (6, '쿠폰은 어디서 사용하나요?', '2025-07-03 14:00:00', '결제 단계에서 쿠폰을 사용할 수 있습니다.'),
    (7, '좌석 변경은 가능한가요?', '2025-07-04 15:30:00', '좌석 변경은 불가능하며 취소 후 재예매 해주세요.'),
    (8, '문의사항은 어디서 남기나요?', '2025-07-04 16:30:00', '고객센터에서 문의하실 수 있습니다.'),
    (9, '모바일 티켓 발급 방법은?', '2025-07-05 17:00:00', '예매 완료 후 문자로 발급됩니다.'),
    (10, '관람 등급은 어디서 확인하나요?', '2025-07-05 18:00:00', '영화 상세 페이지에서 확인 가능합니다.');

-- 결제(payment) 가데이터 15개 생성
DROP TEMPORARY TABLE IF EXISTS temp_numbers;
CREATE TEMPORARY TABLE temp_numbers (n INT);
INSERT INTO temp_numbers (n)
SELECT a.N + 1
FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
      SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION
      SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14) a;

INSERT IGNORE INTO payment (
    paymentcd,
    paymentmethod,
    paymenttime,
    amount,
    paymentstatus
)
SELECT
    CONCAT('PAY', LPAD(n, 3, '0')),
    ELT(FLOOR(1 + (RAND() * 4)), '카카오 뱅크', '농협', '토스페이', '네이버 페이'),
    DATE_ADD('2025-07-01', INTERVAL FLOOR(RAND()*7) DAY) + INTERVAL FLOOR(RAND()*24) HOUR + INTERVAL FLOOR(RAND()*60) MINUTE,
    ELT(FLOOR(1 + (RAND() * 3)), 10000, 20000, 30000),
    '결제 완료'
FROM temp_numbers;

-- 예약(reservation) 가데이터 1000개 생성
DROP TEMPORARY TABLE IF EXISTS temp_numbers;
CREATE TEMPORARY TABLE temp_numbers (n INT);

INSERT INTO temp_numbers (n)
SELECT (a.N + b.N * 10 + c.N * 100 + 1) AS num
FROM (
         SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
         SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
     ) a,
     (
         SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
         SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
     ) b,
     (
         SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
         UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9

     ) c
WHERE (a.N + b.N * 10 + c.N * 100 + 1) <= 1000;

INSERT IGNORE INTO reservation (
    reservationcd,
    userid,
    schedulecd,
    reservationtime,
    reservationstatus,
    seatcd,
    paymentcd
)
SELECT
    CONCAT(LPAD(n, 12, '0')),
    CONCAT('user', LPAD(FLOOR(1 + (RAND() * 50)), 3, '0')),
    (SELECT schedulecd FROM schedule ORDER BY RAND() LIMIT 1),
    DATE_ADD('2025-07-25', INTERVAL FLOOR(RAND()*13) DAY)
      + INTERVAL FLOOR(RAND()*24) HOUR + INTERVAL FLOOR(RAND()*60) MINUTE,
    IF(RAND() < 0.5, '예약완료', '예약취소'),
    CONCAT(CHAR(65 + FLOOR(RAND()*10)), LPAD(FLOOR(1 + (RAND()*10)), 2, '0')),
    CONCAT('PAY', LPAD(FLOOR(1 + (RAND()*15)), 3, '0'))
FROM temp_numbers;

-- staff 가데이터 생성
DROP TEMPORARY TABLE IF EXISTS temp_numbers;
CREATE TEMPORARY TABLE temp_numbers (n INT);
INSERT INTO temp_numbers (n)
SELECT a.N + 1
FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
      SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION
      SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
      UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
      UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
      UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
     ) a;

INSERT IGNORE INTO staff (
    staffid,
    staffname,
    dept,
    position,
    phone,
    email,
    theater,
    hiredate,
    shifttype,
    role,
    status
)
SELECT
    CONCAT('staff', LPAD(n, 3, '0')),
    CONCAT('직원', n, '번'),
    ELT(FLOOR(1 + (RAND() * 5)), '운영팀', '고객서비스', '매표팀', '상영관팀', '매점팀'),
    ELT(FLOOR(1 + (RAND() * 3)), '사원', '대리', '매니저'),
    CONCAT('010-', LPAD(FLOOR(RAND()*9000)+1000, 4, '0'), '-', LPAD(FLOOR(RAND()*9000)+1000, 4, '0')),
    CONCAT('staff', n, '@example.com'),
    ELT(FLOOR(1 + (RAND() * 8)), 'THR001', 'THR002', 'THR003', 'THR004', 'THR005', 'THR006', 'THR007', 'THR008'),
    DATE_ADD('2000-01-01', INTERVAL FLOOR(RAND()*9000) DAY),
    ELT(FLOOR(1 + (RAND() * 2)), '주간', '야간'),
    ELT(FLOOR(1 + (RAND() * 5)), '지점 관리', '고객 응대', '매표', '상영관 관리', '매점 판매'),
    ELT(FLOOR(1 + (RAND() * 2)), '근무중', '휴가')
FROM temp_numbers;
