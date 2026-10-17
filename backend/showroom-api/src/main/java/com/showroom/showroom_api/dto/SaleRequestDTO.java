package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleRequestDTO {
    private Long vehicleId;
    private Long customerId;
    private Double target;
    private Integer quantity;
    private LocalDate date;
    private String offer;
}
