package com.example.thescreen.repository;

import com.example.thescreen.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.crypto.spec.OAEPParameterSpec;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> { // User 엔티티 리포지토리
    Optional<User> findByUserid(String userid);
    boolean existsByUserid(String userid);

    User findByUserpw(String userpw);
}