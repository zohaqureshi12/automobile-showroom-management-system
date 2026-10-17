package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesByBrandDTO {
    private String brand;
    private Long unitsSold;
    private Double totalRevenue;
}
