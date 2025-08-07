package com.example.thescreen.chatbot;

import com.example.thescreen.entity.Faq;
import com.example.thescreen.entity.MovieView;
import com.example.thescreen.repository.FaqRepository;
import com.example.thescreen.repository.MovieViewRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class VectorStoreInitializer {

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private MovieViewRepository movieViewRepository;

    @Autowired
    private VectorStore vectorStore;

    @Bean
    public CommandLineRunner vectorStoreLoader() {
        return args -> {
            // FAQ 데이터를 벡터로 변환
            List<Faq> faqs = faqRepository.findAll();
            List<Document> faqDocuments = faqs.stream()
                    .map(faq -> new Document(faq.getFaqsub() + ": " + faq.getFaqcontents(),
                            Map.of("type", "faq", "id", faq.getFaqnum())))
                    .collect(Collectors.toList());

            // 영화 데이터를 벡터로 변환
            List<MovieView> movies = movieViewRepository.findAll();
            List<Document> movieDocuments = movies.stream()
                    .map(movie -> new Document(
                            movie.getMovienm() + " (장르: " + movie.getGenre() + ", 개봉일: " +
                                    (movie.getReleasedate() != null ? new SimpleDateFormat("yyyy-MM-dd").format(movie.getReleasedate()) : "미공개") + "): " +
                                    movie.getDescription(),
                            Map.of("type", "movie", "moviecd", movie.getMoviecd())))
                    .collect(Collectors.toList());

            // 벡터 스토어에 저장
            vectorStore.add(faqDocuments);
            vectorStore.add(movieDocuments);
            System.out.println("Vector store initialized with FAQs and Movies");
        };
    }
}