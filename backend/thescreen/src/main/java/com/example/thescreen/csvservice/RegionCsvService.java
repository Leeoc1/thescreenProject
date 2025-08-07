package com.example.thescreen.csvservice;

import com.example.thescreen.entity.Region;
import com.example.thescreen.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.opencsv.CSVReader;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class RegionCsvService {

    @Autowired
    private RegionRepository regionRepository;

    public void importRegionsFromCSV() throws Exception {
        if (regionRepository.count() > 0) {
            System.out.println("Region 테이블에 데이터가 이미 존재합니다. 작업을 건너뜁니다.");
            return;
        }

        Set<String> regionSet = new LinkedHashSet<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("cgv_data.csv"), StandardCharsets.UTF_8))) {
            String[] fields;
            boolean isFirstLine = true;
            while ((fields = reader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                if (fields.length >= 6) {
                    String regionName = fields[5].trim();
                    if (!regionName.isEmpty()) {
                        regionSet.add(regionName);
                    }
                }
            }
        }

        int regionCode = 1;
        for (String regionName : regionSet) {
            Region region = new Region();
            region.setRegioncd(String.valueOf(regionCode++));
            region.setRegionnm(regionName);
            regionRepository.save(region);
        }
        System.out.println("Region 테이블에 데이터 저장 완료!");
    }
}