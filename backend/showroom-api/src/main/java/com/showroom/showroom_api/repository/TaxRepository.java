package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaxRepository extends JpaRepository<Tax, Long> {

    Optional<Tax> findByVehicle_Id(Long vehicleId);

    boolean existsByVehicle_Id(Long vehicleId);
}
