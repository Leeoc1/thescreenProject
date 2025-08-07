package com.example.thescreen.repository;

import com.example.thescreen.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    @Query("SELECT MAX(CAST(r.reservationcd AS LONG)) FROM Reservation r")
    Long findMaxReservationId();
}