package com.example.thescreen.controller;

import com.example.thescreen.entity.Notice;
import com.example.thescreen.repository.NoticeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
public class NoticeController {

    private final NoticeRepository noticeRepository;

    public NoticeController(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    @GetMapping("/notice")
    public List<Notice> getNotices() {
        return noticeRepository.findAll();
    }

    @GetMapping("/{noticenum}")
    public List<Notice> getNotices(@PathVariable Long noticenum) {
        return noticeRepository.findByNoticenum(noticenum);
    }
}