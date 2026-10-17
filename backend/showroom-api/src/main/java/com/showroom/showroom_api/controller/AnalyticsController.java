package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.AnalyticsSummaryDTO;
import com.showroom.showroom_api.dto.RevenueByShowroomDTO;
import com.showroom.showroom_api.dto.SalesByBrandDTO;
import com.showroom.showroom_api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/analytics/summary
     * Returns a single DTO with aggregate metrics for the entire system.
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    /**
     * GET /api/analytics/revenue-by-showroom
     * Returns total sales revenue and unit count per showroom.
     */
    @GetMapping("/revenue-by-showroom")
    public ResponseEntity<List<RevenueByShowroomDTO>> getRevenueByShowroom() {
        return ResponseEntity.ok(analyticsService.getRevenueByShowroom());
    }

    /**
     * GET /api/analytics/sales-by-brand
     * Returns units sold and total revenue per vehicle brand.
     */
    @GetMapping("/sales-by-brand")
    public ResponseEntity<List<SalesByBrandDTO>> getSalesByBrand() {
        return ResponseEntity.ok(analyticsService.getSalesByBrand());
    }
}
