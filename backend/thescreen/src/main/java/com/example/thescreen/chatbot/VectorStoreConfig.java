package com.example.thescreen.chatbot;

import com.example.thescreen.entity.Faq;
import com.example.thescreen.repository.FaqRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class VectorStoreConfig {

    private final FaqRepository faqRepository;

    public VectorStoreConfig(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @Bean
    @ConditionalOnProperty(name = "spring.ai.openai.api-key")
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        // MariaDB 벡터 지원 안됨 - SimpleVectorStore 사용 (메모리 기반)
        SimpleVectorStore simpleVectorStore = new SimpleVectorStore(embeddingModel);

        try {
            List<Faq> faqs = faqRepository.findAll();
            for (Faq faq : faqs) {
                Document doc = new Document(
                        faq.getFaqsub() + ": " + faq.getFaqcontents(),
                        java.util.Map.of("type", "faq", "id", faq.getFaqnum())
                );
                simpleVectorStore.add(java.util.List.of(doc));
            }
            System.out.println("SimpleVectorStore initialized successfully");
        } catch (Exception e) {
            System.err.println("VectorStore initialization failed: " + e.getMessage());
        }

        return simpleVectorStore;
    }
}
