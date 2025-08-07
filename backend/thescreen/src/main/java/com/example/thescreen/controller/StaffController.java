package com.example.thescreen.controller;


import com.example.thescreen.entity.Staff;
import com.example.thescreen.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@RestController
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class StaffController {
    @Autowired
    private StaffRepository staffRepository;


    @GetMapping("/staff")
    public ResponseEntity<List<Staff>> getStaff() {
        List<Staff> staffs = staffRepository.findAll();
        return new ResponseEntity<>(staffs, HttpStatus.OK);
    }

    @PutMapping("/staff/update")
    public ResponseEntity<Staff> updateStaff(@RequestBody Staff staff) {
        // staffid로 기존 데이터 조회
        Optional<Staff> optionalStaff = staffRepository.findById(staff.getStaffid());

        // 필요한 필드만 업데이트
        if(optionalStaff.isPresent()) {
            Staff existingStaff = optionalStaff.get();

            existingStaff.setDept(staff.getDept());
            existingStaff.setPosition(staff.getPosition());
            existingStaff.setPhone(staff.getPhone());
            existingStaff.setEmail(staff.getEmail());
            existingStaff.setTheater(staff.getTheater());
            existingStaff.setRole(staff.getRole());
            existingStaff.setStatus(staff.getStatus());

            // 저장
            staffRepository.save(existingStaff);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/staff/add")
    public ResponseEntity<Object> addStaff(@RequestBody Staff staff) {
        try {
            // 입력 데이터 검증
            if (staff.getStaffid() == null || staff.getStaffid().trim().isEmpty()) {
                return new ResponseEntity<>("직원 ID는 필수 입력 항목입니다.", HttpStatus.BAD_REQUEST);
            }

            // 직원 ID 중복 체크
            Optional<Staff> existingStaff = staffRepository.findById(staff.getStaffid());
            if (existingStaff.isPresent()) {
                return new ResponseEntity<>("이미 존재하는 직원 ID입니다.", HttpStatus.CONFLICT);
            }

            // 새 직원 정보 저장

            // hiredate 직원 추가하는 날짜로 설정 (직접 입력하는 걸로 해도 상관없음, 여기만 지우면 됨)
            // LocalDate.now()는 자동으로 yyyy-mm-dd 형식으로 저장해줌
            staff.setHiredate(LocalDate.now());

            Staff savedStaff = staffRepository.save(staff);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
