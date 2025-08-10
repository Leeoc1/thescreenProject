package com.example.thescreen.controller;

import com.example.thescreen.entity.MyCinema;
import com.example.thescreen.repository.MyCinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class MycinemaController {
    @Autowired
    private MyCinemaRepository myCinemaRepository;

    @GetMapping("/{userid}/mycinemas")
    public List<MyCinema> getMyCinemas(@PathVariable String userid) {
        return myCinemaRepository.findByUserid(userid);
    }
    
    @PostMapping("/{userid}/mycinemas")
    public MyCinema addMyCinema(@PathVariable String userid, @RequestBody Map<String, String> request) {
        String cinemaid = request.get("cinemaid");
        MyCinema mycinema = new MyCinema();
        mycinema.setUserid(userid);
        mycinema.setCinemacd(cinemaid);
        return myCinemaRepository.save(mycinema);
    }
    
    @DeleteMapping("/{userid}/mycinemas/{cinemaid}")
    public void removeMyCinema(@PathVariable String userid, @PathVariable String cinemaid) {
        myCinemaRepository.deleteByUseridAndCinemacd(userid, cinemaid);
    }
}
