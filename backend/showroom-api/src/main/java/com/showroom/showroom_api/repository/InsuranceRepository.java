package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {

    Optional<Insurance> findByVehicle_Id(Long vehicleId);

    boolean existsByVehicle_Id(Long vehicleId);
}
