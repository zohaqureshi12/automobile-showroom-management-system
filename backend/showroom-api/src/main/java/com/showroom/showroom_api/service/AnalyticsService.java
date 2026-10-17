package com.showroom.showroom_api.service;

import com.showroom.showroom_api.dto.AnalyticsSummaryDTO;
import com.showroom.showroom_api.dto.RevenueByShowroomDTO;
import com.showroom.showroom_api.dto.SalesByBrandDTO;
import com.showroom.showroom_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AnalyticsService {

    private final SalesRepository salesRepository;
    private final VehicleRepository vehicleRepository;
    private final ServicesRepository servicesRepository;
    private final CustomerRepository customerRepository;
    private final ShowroomRepository showroomRepository;

    /**
     * Computes a dashboard-level summary across the entire showroom system.
     * totalRevenue = sum of sale targets + sum of service ticket prices
     */
    public AnalyticsSummaryDTO getSummary() {
        Double salesRevenue = salesRepository.sumAllSaleTargets();
        Double servicesRevenue = servicesRepository.sumAllServicePrices();

        double totalRevenue = (salesRevenue != null ? salesRevenue : 0.0)
                + (servicesRevenue != null ? servicesRevenue : 0.0);

        long totalVehicles = vehicleRepository.count();
        long totalVehiclesSold = salesRepository.countDistinctVehiclesSold();
        long totalVehiclesInStock = totalVehicles - totalVehiclesSold;

        long totalActiveServices = servicesRepository.count();
        long totalCustomers = customerRepository.count();
        long totalShowrooms = showroomRepository.count();

        return AnalyticsSummaryDTO.builder()
                .totalRevenue(totalRevenue)
                .totalVehiclesInStock(totalVehiclesInStock)
                .totalVehiclesSold(totalVehiclesSold)
                .totalActiveServices(totalActiveServices)
                .totalCustomers(totalCustomers)
                .totalShowrooms(totalShowrooms)
                .build();
    }

    /**
     * Revenue aggregated per showroom via a JPQL join across Showroom → Vehicle → Sales.
     */
    public List<RevenueByShowroomDTO> getRevenueByShowroom() {
        List<Object[]> rows = salesRepository.findRevenueByShowroom();
        return rows.stream()
                .map(row -> RevenueByShowroomDTO.builder()
                        .showroomName((String) row[0])
                        .totalUnitsSold((Long) row[1])
                        .totalRevenue((Double) row[2])
                        .build())
                .toList();
    }

    /**
     * Sales aggregated per vehicle brand via a JPQL group-by on Vehicle.brand.
     */
    public List<SalesByBrandDTO> getSalesByBrand() {
        List<Object[]> rows = salesRepository.findSalesByBrand();
        return rows.stream()
                .map(row -> SalesByBrandDTO.builder()
                        .brand((String) row[0])
                        .unitsSold((Long) row[1])
                        .totalRevenue((Double) row[2])
                        .build())
                .toList();
    }
}
