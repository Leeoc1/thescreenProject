-- 쿠폰 테이블 생성 (이미 생성되어 있다면 생략)
CREATE TABLE IF NOT EXISTS coupon (
    couponnum INT AUTO_INCREMENT PRIMARY KEY,
    userid VARCHAR(20) NOT NULL,
    couponcd INT NOT NULL,
    couponname TEXT NOT NULL,
    discount INT DEFAULT 0,
    couponstatus BOOLEAN NOT NULL DEFAULT TRUE,
    couponusedate DATE DEFAULT NULL,
    couponexpiredate DATE NOT NULL
);

-- 테스트용 쿠폰 데이터 삽입
INSERT INTO coupon (userid, couponcd, couponname, discount, couponstatus, couponusedate, couponexpiredate) VALUES
-- 사용 가능한 쿠폰들
('testuser', 2, '웰컴 쿠폰', 2000, TRUE, NULL, '2025-12-31'),
('testuser', 1, '할인쿠폰', 1000, TRUE, NULL, '2025-11-30'),
('testuser', 5, '영화관람권', 10000, TRUE, NULL, '2025-08-31'),
('testuser', 3, '학생 할인 쿠폰', 1500, TRUE, NULL, '2025-10-31'),

-- 사용된 쿠폰들
('testuser', 1, '할인쿠폰', 1000, FALSE, '2025-07-20', '2025-12-31'),
('testuser', 4, '시니어 할인 쿠폰', 1500, FALSE, '2025-07-15', '2025-09-30'),

-- 만료된 쿠폰
('testuser', 2, '웰컴 쿠폰', 2000, TRUE, NULL, '2025-07-20'),

-- 다른 사용자의 쿠폰 (테스트용)
('user2', 2, '웰컴 쿠폰', 2000, TRUE, NULL, '2025-12-31'),
('user2', 5, '영화관람권', 10000, TRUE, NULL, '2025-09-30');
