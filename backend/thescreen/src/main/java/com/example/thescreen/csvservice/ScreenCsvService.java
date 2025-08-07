package com.example.thescreen.csvservice;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.Screen;
import com.example.thescreen.repository.CinemaRepository;
import com.example.thescreen.repository.ScreenRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
public class ScreenCsvService {
    @Autowired
    private ScreenRepository screenRepository;
    @Autowired
    private CinemaRepository cinemaRepository;

    public void importScreensFromCSV() throws Exception {
        if (screenRepository.count() > 0) {
            System.out.println("Screen 테이블에 데이터가 이미 존재합니다. 작업을 건너뜁니다.");
            return;
        }
        if (cinemaRepository.count() == 0) {
            System.out.println("Cinema 테이블에 데이터가 없습니다. Screen 저장을 건너뜁니다.");
            return;
        }
        Set<String> screenKeySet = new HashSet<>();
        Random random = new Random();
        try (CSVReader reader = new CSVReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("cgv_data.csv"), StandardCharsets.UTF_8))) {
            String[] fields;
            boolean isFirstLine = true;
            int screenCode = 1;
            while ((fields = reader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                // screenname: 5번째(4), screentype: 7번째(6), cinema name: 4번째(3)
                String screenname = fields[4].trim();
                String screentype = fields[6].trim();
                String cinemaName = fields[3].trim();
                if (screenname.isEmpty() || screentype.isEmpty() || cinemaName.isEmpty())
                    continue;
                Optional<Cinema> cinemaOpt = cinemaRepository.findByCinemanm(cinemaName);
                if (cinemaOpt.isEmpty())
                    continue;
                String cinemacd = cinemaOpt.get().getCinemacd();
                String screenKey = screenname + ":" + cinemacd;
                if (screenKeySet.contains(screenKey))
                    continue;
                String screencd = String.format("SCR%03d", screenCode++);
                int allseat = 90 + random.nextInt(31); // 90~120
                Screen screen = new Screen();
                screen.setScreencd(screencd);
                screen.setScreenname(screenname);
                screen.setScreentype(screentype);
                screen.setAllseat(allseat);
                screen.setReservationseat(0);
                screen.setScreenstatus("운영중");
                screen.setCinemacd(cinemacd);
                screenRepository.save(screen);
                screenKeySet.add(screenKey);
            }
        }
        System.out.println("Screen 테이블에 데이터 저장 완료!");
    }
}