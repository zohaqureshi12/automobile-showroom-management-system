package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Showroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShowroomRepository extends JpaRepository<Showroom, Long> {

    Optional<Showroom> findByName(String name);
}
