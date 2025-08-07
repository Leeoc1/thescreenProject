package com.example.thescreen.chatbot;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class CachedVectorStore implements VectorStore {

    private final EmbeddingModel embeddingModel;

    private final Map<String, Document> documentsById = new HashMap<>();
    private final Map<String, float[]> embeddingsById = new HashMap<>();

    public CachedVectorStore(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    // 문서 추가: 임베딩을 미리 계산해서 저장
    public void addDocument(Document document) {
        EmbeddingResponse response = embeddingModel.embedForResponse(List.of(document.getContent()));
        float[] embedding = response.getResults().get(0).getOutput();
        documentsById.put(document.getId(), document);
        embeddingsById.put(document.getId(), embedding);
    }

    @Override
    public void add(List<Document> documents) {
        for (Document document : documents) {
            addDocument(document);
        }
    }

    @Override
    public List<Document> similaritySearch(SearchRequest searchRequest) {
        EmbeddingResponse response = embeddingModel.embedForResponse(List.of(searchRequest.getQuery()));
        float[] queryEmbedding = response.getResults().get(0).getOutput();

        return embeddingsById.entrySet().stream()
                .map(entry -> {
                    String id = entry.getKey();
                    float similarity = cosineSimilarity(queryEmbedding, entry.getValue());
                    return Map.entry(documentsById.get(id), similarity);
                })
                .sorted((e1, e2) -> Float.compare(e2.getValue(), e1.getValue()))
                .limit(searchRequest.getTopK())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private float cosineSimilarity(float[] vec1, float[] vec2) {
        float dot = 0f, normA = 0f, normB = 0f;
        for (int i = 0; i < vec1.length; i++) {
            dot += vec1[i] * vec2[i];
            normA += vec1[i] * vec1[i];
            normB += vec2[i] * vec2[i];
        }
        return (float) (dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10));
    }

    @Override
    public Optional<Boolean> delete(List<String> ids) {
        for (String id : ids) {
            documentsById.remove(id);
            embeddingsById.remove(id);
        }
        return Optional.of(true);
    }
}
