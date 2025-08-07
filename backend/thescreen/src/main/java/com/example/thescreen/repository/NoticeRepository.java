package com.example.thescreen.repository;

import com.example.thescreen.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findTop5ByNoticetypeNotOrderByNoticenumDesc(String noticetype);
    List<Notice> findByNoticenum(Long noticenum);
    List<Notice> findByNoticesubContainingIgnoreCase(String noticesub);
}