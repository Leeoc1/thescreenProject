package com.example.thescreen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "faq")
@Getter
@NoArgsConstructor
public class Faq {

    @Id
    private Long faqnum; // FAQ 번호 (PK)

    @Column(length = 50)
    private String faqsub; // FAQ 제목

    @Column(columnDefinition = "TEXT")
    private String faqcontents; // FAQ 답변 내용

    @Column(nullable = false)
    private LocalDateTime faqdate; // 게시 날짜
}

