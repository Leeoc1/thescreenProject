package com.example.thescreen.chatbot;

import com.example.thescreen.entity.Faq;
import com.example.thescreen.repository.FaqRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
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
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        CachedVectorStore cachedVectorStore = new CachedVectorStore(embeddingModel);

        List<Faq> faqs = faqRepository.findAll();
        for (Faq faq : faqs) {
            Document doc = new Document(
                    String.valueOf(faq.getFaqnum())
            );
            cachedVectorStore.addDocument(doc);
        }

        return cachedVectorStore;
    }
}
