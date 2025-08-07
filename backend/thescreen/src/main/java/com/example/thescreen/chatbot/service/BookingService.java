package com.example.thescreen.chatbot.service;

import com.example.thescreen.entity.Cinema;
import com.example.thescreen.entity.MovieView; // MovieView import 추가
import com.example.thescreen.entity.ScheduleView;
import com.example.thescreen.repository.CinemaRepository;
import com.example.thescreen.repository.ScheduleViewRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 예매 처리 관련 기능을 담당하는 서비스
 * 자연어 예매, 직접 예매, 좌석 생성 등의 기능 제공
 */
@Service
public class BookingService {

    private final CinemaRepository cinemaRepository;
    private final ScheduleViewRepository scheduleViewRepository;
    private final NaturalLanguageService naturalLanguageService;
    private final PriceService priceService;

    public BookingService(CinemaRepository cinemaRepository,
            ScheduleViewRepository scheduleViewRepository,
            NaturalLanguageService naturalLanguageService,
            PriceService priceService) {
        this.cinemaRepository = cinemaRepository;
        this.scheduleViewRepository = scheduleViewRepository;
        this.naturalLanguageService = naturalLanguageService;
        this.priceService = priceService;
    }

    /**
     * 자연어 예매 처리 메인 메서드
     */
    public Map<String, Object> processNaturalLanguageBooking(String userInput, List<Cinema> allCinemas,
            List<MovieView> allMovies) { // MovieView로 변경
        try {
            // 1. 자연어에서 정보 추출
            Map<String, Object> extractedInfo = naturalLanguageService.extractBookingInfo(userInput, allCinemas,
                    allMovies);

            if (extractedInfo.containsKey("error")) {
                return extractedInfo;
            }

            // 2. 가격 계산 추가
            @SuppressWarnings("unchecked")
            Map<String, Integer> ageBreakdown = (Map<String, Integer>) extractedInfo.get("ageBreakdown");
            Map<String, Object> priceInfo = priceService.calculatePriceBreakdown(ageBreakdown);
            extractedInfo.put("priceBreakdown", priceInfo.get("breakdown"));
            extractedInfo.put("totalPrice", priceInfo.get("totalPrice"));

            // 3. 추출된 정보로 실제 예매 처리
            return processSmartBooking(extractedInfo);

        } catch (Exception e) {
            e.printStackTrace();
            return createResponse("error", Map.of("message", "예매 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 스마트 예매 처리
     */
    private Map<String, Object> processSmartBooking(Map<String, Object> bookingInfo) {
        String cinemanm = (String) bookingInfo.get("cinemanm");
        String movienm = (String) bookingInfo.get("movienm");
        Object personObj = bookingInfo.get("person");

        int person = 2; // 기본값
        if (personObj instanceof Integer) {
            person = (Integer) personObj;
        } else if (personObj instanceof String) {
            try {
                person = Integer.parseInt((String) personObj);
            } catch (NumberFormatException ignored) {
            }
        }

        // 연령별 인원수와 가격 정보 가져오기
        @SuppressWarnings("unchecked")
        Map<String, Integer> ageBreakdown = (Map<String, Integer>) bookingInfo.get("ageBreakdown");
        @SuppressWarnings("unchecked")
        Map<String, Object> priceBreakdown = (Map<String, Object>) bookingInfo.get("priceBreakdown");
        Object totalPriceObj = bookingInfo.get("totalPrice");

        int totalPrice = 0;
        if (totalPriceObj instanceof Integer) {
            totalPrice = (Integer) totalPriceObj;
        }

        // 해당 극장과 영화의 스케줄 검색
        List<ScheduleView> schedules = scheduleViewRepository
                .findByCinemanmContaining(cinemanm)
                .stream()
                .filter(s -> s.getMovienm().equals(movienm))
                .filter(s -> naturalLanguageService.isAfterNow(s.getStarttime()))
                .sorted(Comparator.comparing(s -> naturalLanguageService.parseDate(s.getStarttime())))
                .collect(Collectors.toList());

        if (schedules.isEmpty()) {
            return createResponse("error", Map.of("message",
                    String.format("%s에서 '%s' 영화의 예약 가능한 상영시간이 없습니다.", cinemanm, movienm)));
        }

        // 가장 빠른 상영시간 선택
        ScheduleView earliestSchedule = schedules.get(0);

        // 자연어 예매용 랜덤 좌석 생성
        List<String> randomSeats = generateRandomSeats(person);

        // 연령별 인원수 문자열 생성
        StringBuilder personDetails = new StringBuilder();
        if (ageBreakdown != null) {
            if (ageBreakdown.get("adult") > 0) {
                personDetails.append("어른 ").append(ageBreakdown.get("adult")).append("명 ");
            }
            if (ageBreakdown.get("youth") > 0) {
                personDetails.append("청소년 ").append(ageBreakdown.get("youth")).append("명 ");
            }
            if (ageBreakdown.get("senior") > 0) {
                personDetails.append("우대 ").append(ageBreakdown.get("senior")).append("명 ");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("cinemanm", cinemanm);
        result.put("cinemacd", bookingInfo.get("cinemacd"));
        result.put("movienm", movienm);
        result.put("person", person);
        result.put("ageBreakdown", ageBreakdown);
        result.put("priceBreakdown", priceBreakdown);
        result.put("totalPrice", totalPrice);
        result.put("starttime", earliestSchedule.getStarttime());
        result.put("schedulecd", earliestSchedule.getSchedulecd());
        result.put("screenname", earliestSchedule.getScreenname());
        result.put("runningtime", earliestSchedule.getRunningtime());
        result.put("randomSeats", randomSeats);
        result.put("directPayment", true);

        String message = String.format("%s에서 '%s' 영화 %s예매가 완료되었습니다.\n상영시간: %s (%s)\n좌석: %s\n총 가격: %,d원",
                cinemanm, movienm,
                personDetails.toString().trim().isEmpty() ? person + "명 " : personDetails.toString(),
                earliestSchedule.getStarttime(), earliestSchedule.getScreenname(),
                String.join(", ", randomSeats), totalPrice);

        result.put("message", message);

        return createResponse("directBookingConfirmed", result);
    }

    /**
     * 다이렉트 예약 (기존 메서드 - 호환성 유지)
     */
    public Map<String, Object> directBookingConfirm(Map<String, Object> bookingData) {
        String region = bookingData.get("region") != null ? bookingData.get("region").toString() : "";
        String movieName = bookingData.get("movie") != null ? bookingData.get("movie").toString() : "";
        int people = 1;
        Object peopleObj = bookingData.get("people");
        if (peopleObj instanceof Integer) {
            people = (Integer) peopleObj;
        } else if (peopleObj instanceof String) {
            try {
                people = Integer.parseInt((String) peopleObj);
            } catch (NumberFormatException e) {
                people = 1;
            }
        }

        Cinema cinema = cinemaRepository.findByAddressContainingIgnoreCase(region).stream()
                .findFirst()
                .orElse(null);

        if (cinema == null) {
            return createResponse("error", Map.of("message", region + " 지역의 극장을 찾을 수 없습니다."));
        }

        // 스케줄 필터
        List<ScheduleView> movieSchedules = scheduleViewRepository.findByCinemanmContaining(cinema.getCinemanm())
                .stream()
                .filter(s -> s.getMovienm().contains(movieName))
                .collect(Collectors.toList());

        if (movieSchedules.isEmpty()) {
            return createResponse("error", Map.of("message", movieName + " 영화의 스케줄이 없습니다."));
        }

        // 가장 빠른 시간 찾기
        ScheduleView earliest = movieSchedules.stream()
                .filter(s -> naturalLanguageService.isAfterNow(s.getStarttime()))
                .min(Comparator.comparing(s -> naturalLanguageService.parseDate(s.getStarttime())))
                .orElse(movieSchedules.get(0));

        Map<String, Object> result = new HashMap<>();
        result.put("cinemacd", cinema.getCinemacd());
        result.put("cinemanm", cinema.getCinemanm());
        result.put("movienm", movieName);
        result.put("people", people);
        result.put("starttime", earliest.getStarttime());
        result.put("schedulecd", earliest.getSchedulecd());
        result.put("screenname", earliest.getScreenname());

        return createResponse("directBookingConfirmed", result);
    }

    /**
     * 랜덤 좌석 생성 (자연어 예매용)
     */
    public List<String> generateRandomSeats(int personCount) {
        List<String> seats = new ArrayList<>();
        Random random = new Random();

        // 좌석 행: A~J (총 10행)
        char[] rows = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' };
        // 좌석 번호: 1~20 (총 20열)
        int maxCol = 20;

        Set<String> usedSeats = new HashSet<>();

        for (int i = 0; i < personCount; i++) {
            String seat;
            int attempts = 0;

            do {
                char row = rows[random.nextInt(rows.length)];
                int col = random.nextInt(maxCol) + 1;
                seat = String.format("%c%d", row, col);
                attempts++;

                // 무한 루프 방지 (100회 시도 후 순차적으로 배정)
                if (attempts > 100) {
                    for (char r : rows) {
                        for (int c = 1; c <= maxCol; c++) {
                            String fallbackSeat = String.format("%c%d", r, c);
                            if (!usedSeats.contains(fallbackSeat)) {
                                seat = fallbackSeat;
                                break;
                            }
                        }
                        if (!usedSeats.contains(seat))
                            break;
                    }
                    break;
                }
            } while (usedSeats.contains(seat));

            usedSeats.add(seat);
            seats.add(seat);
        }

        // 좌석을 정렬해서 반환
        seats.sort((s1, s2) -> {
            char row1 = s1.charAt(0);
            char row2 = s2.charAt(0);
            if (row1 != row2) {
                return Character.compare(row1, row2);
            }
            int col1 = Integer.parseInt(s1.substring(1));
            int col2 = Integer.parseInt(s2.substring(1));
            return Integer.compare(col1, col2);
        });

        return seats;
    }

    private Map<String, Object> createResponse(String type, Map<String, Object> data) {
        return Map.of("type", type, "data", data);
    }
}
