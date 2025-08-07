package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "Cinema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cinema {
    @Id
    @Column(length = 20)
    private String cinemacd; // 지점 코드 (PK)

    @Column(length = 20)
    private String cinemanm; // 지점명

    @Column(length = 255)
    private String address; // 주소

    @Column(length = 15)
    private String tel; // 전화번호

    @Column(length = 20)
    private String status; // 운영상태 (점검중, 정상)

    @Column(length = 20)
    private String regioncd; // 지역 코드 (FK는 설정하지 않고 역할만)




}
