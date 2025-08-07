package com.example.thescreen.controller;

import com.example.thescreen.entity.Faq;
import com.example.thescreen.repository.FaqRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faq")
public class FaqController {

    private final FaqRepository faqRepository;

    public FaqController(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @GetMapping("/faq")
    public List<Faq> getFaqs() {
        return faqRepository.findAll();
    }

}