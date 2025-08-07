package com.example.thescreen.service;

import com.example.thescreen.util.RedisUtil;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
public class CoolsmsService {

    private final DefaultMessageService messageService;
    private final RedisUtil redisUtil; // InMemoryUtil로 대체 가능

    public CoolsmsService(@Value("${coolsms.apiKey}") String apiKey,
                          @Value("${coolsms.secretKey}") String secretKey,
                          RedisUtil redisUtil) {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, secretKey, "https://api.coolsms.co.kr");
        this.redisUtil = redisUtil;
    }

    private String createRandomNumber() {
        Random rand = new Random();
        StringBuilder randomNum = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            randomNum.append(rand.nextInt(10));
        }
        return randomNum.toString();
    }

    @Transactional
    public void certificateSMS(String phoneNumber) {
        phoneNumber = phoneNumber.replaceAll("[^0-9]", "");
        String randomNum = createRandomNumber();
        redisUtil.set(phoneNumber, randomNum, 5);
        Message message = new Message();
        message.setFrom("01092577663");
        message.setTo(phoneNumber);
        message.setText("[더 스크린] 인증번호 [" + randomNum + "]를 입력해 주세요.");

        try {
            SingleMessageSentResponse response = messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("SMS 전송 성공: " + response);
        } catch (Exception e) {
            System.err.println("SMS 전송 실패: " + e.getMessage());
            throw new RuntimeException("SMS 전송 실패", e);
        }
    }

    public boolean verifySMS(String phoneNumber, String inputCode) {
        phoneNumber = phoneNumber.replaceAll("[^0-9]", "");
        Object storedCode = redisUtil.get(phoneNumber);
        if (storedCode != null && storedCode.toString().equals(inputCode)) {
            redisUtil.delete(phoneNumber);
            return true;
        }
        return false;
    }
}