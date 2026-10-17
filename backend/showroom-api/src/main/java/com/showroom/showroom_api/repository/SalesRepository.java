package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesRepository extends JpaRepository<Sales, Long> {

    List<Sales> findByCustomer_Id(Long customerId);

    List<Sales> findByVehicle_Id(Long vehicleId);

    boolean existsByVehicle_Id(Long vehicleId);

    // ---- Analytics queries ----

    @Query("SELECT COALESCE(SUM(s.target), 0) FROM Sales s")
    Double sumAllSaleTargets();

    @Query("SELECT COUNT(DISTINCT s.vehicle.id) FROM Sales s")
    Long countDistinctVehiclesSold();

    /**
     * Revenue per showroom: joins Sales → Vehicle → Showroom
     * Returns Object[] rows: [showroomName, unitsSold, totalRevenue]
     */
    @Query("SELECT sh.name, COUNT(s.id), COALESCE(SUM(s.target), 0) " +
           "FROM Sales s JOIN s.vehicle v JOIN v.showroom sh " +
           "GROUP BY sh.name ORDER BY SUM(s.target) DESC")
    List<Object[]> findRevenueByShowroom();

    /**
     * Sales per vehicle brand.
     * Returns Object[] rows: [brand, unitsSold, totalRevenue]
     */
    @Query("SELECT v.brand, COUNT(s.id), COALESCE(SUM(s.target), 0) " +
           "FROM Sales s JOIN s.vehicle v " +
           "GROUP BY v.brand ORDER BY SUM(s.target) DESC")
    List<Object[]> findSalesByBrand();
}
