package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByShowroom_Id(Long showroomId);

    List<Vehicle> findByBrandIgnoreCase(String brand);

    List<Vehicle> findByTypeIgnoreCase(String type);

    Optional<Vehicle> findByNumberPlate(String numberPlate);

    boolean existsByNumberPlate(String numberPlate);
}
