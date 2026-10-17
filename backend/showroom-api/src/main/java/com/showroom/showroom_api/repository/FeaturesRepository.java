package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Features;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeaturesRepository extends JpaRepository<Features, Long> {

    Optional<Features> findByVehicle_Id(Long vehicleId);

    boolean existsByVehicle_Id(Long vehicleId);
}
