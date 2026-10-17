package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicesRepository extends JpaRepository<Services, Long> {

    List<Services> findByShowroom_Id(Long showroomId);

    List<Services> findByCustomer_Id(Long customerId);

    @Query("SELECT COALESCE(SUM(s.price), 0) FROM Services s")
    Double sumAllServicePrices();
}
