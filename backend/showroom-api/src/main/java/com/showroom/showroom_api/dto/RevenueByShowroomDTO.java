package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByShowroomDTO {
    private String showroomName;
    private Long totalUnitsSold;
    private Double totalRevenue;
}
