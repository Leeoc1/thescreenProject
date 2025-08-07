package com.example.thescreen.csvservice;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.Region;
import com.example.thescreen.repository.CinemaRepository;
import com.example.thescreen.repository.RegionRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class CinemaCsvService {
    @Autowired
    private CinemaRepository cinemaRepository;
    @Autowired
    private RegionRepository regionRepository;

    public void importCinemasFromCSV() throws Exception {
        if (cinemaRepository.count() > 0) {
            System.out.println("Cinema 테이블에 데이터가 이미 존재합니다. 작업을 건너뜁니다.");
            return;
        }
        if (regionRepository.count() == 0) {
            System.out.println("Region 테이블에 데이터가 없습니다. Cinema 저장을 건너뜁니다.");
            return;
        }
        Set<String> nameSet = new HashSet<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("cgv_data.csv"), StandardCharsets.UTF_8))) {
            String[] fields;
            boolean isFirstLine = true;
            int cinemaCode = 1;
            while ((fields = reader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                // 컬럼 인덱스: name, road_address, phone, region
                // name: 1, road_address: 2, phone: 3, region: 5 (예시, 실제 인덱스는 CSV 확인 필요)
                String name = fields[3].trim();
                String address = fields[2].trim();
                String phone = fields[0].trim();
                String regionName = fields[5].trim();
                if (name.isEmpty() || address.isEmpty() || phone.isEmpty() || regionName.isEmpty())
                    continue;
                if (nameSet.contains(name) || cinemaRepository.existsByCinemanm(name))
                    continue;
                Optional<Region> regionOpt = regionRepository.findByRegionnm(regionName);
                if (regionOpt.isEmpty())
                    continue;
                String regioncd = regionOpt.get().getRegioncd();
                String cinemacd = String.format("THR%03d", cinemaCode++);
                Cinema cinema = new Cinema();
                cinema.setCinemacd(cinemacd);
                cinema.setCinemanm(name);
                cinema.setAddress(address);
                cinema.setTel(phone);
                cinema.setStatus("정상");
                cinema.setRegioncd(regioncd);
                cinemaRepository.save(cinema);
                nameSet.add(name);
            }
        }
        System.out.println("Cinema 테이블에 데이터 저장 완료!");
    }
}