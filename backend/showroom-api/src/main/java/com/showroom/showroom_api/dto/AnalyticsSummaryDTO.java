package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryDTO {
    private Double totalRevenue;
    private Long totalVehiclesInStock;
    private Long totalVehiclesSold;
    private Long totalActiveServices;
    private Long totalCustomers;
    private Long totalShowrooms;
}
