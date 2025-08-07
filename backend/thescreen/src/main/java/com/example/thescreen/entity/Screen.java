package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "screen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Screen {

    @Id
    @Column(length = 20)
    private String screencd; // 상영관 코드 (PK)

    @Column(length = 50)
    private String screenname; // 상영관 이름 (ex: 1관, 2관, 3관 등)

    @Column(length = 50)
    private String screentype; // 상영관 타입 (ex: 2D, 3D, 4D, 5D 등)

    @Column
    private int allseat; // 총 좌석 수
 
    @Column
    private int reservationseat; // 예약시 +1 (max = allseat) 예약 된 좌석 수

    @Column(length = 20)
    private String screenstatus; // 상영관 상태 (ex: 사용중, 사용불가 등 )

    @Column(length = 20)
    private String cinemacd; // 소속 지점 코드 (FK는 설정하지 않고 역할만)
}
