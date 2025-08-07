package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "region")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region {
    @Id
    @Column(length = 20)
    private String regioncd; // 지역 코드 (PK)

    @Column(length = 50)
    private String regionnm; // 지역 이름
}
