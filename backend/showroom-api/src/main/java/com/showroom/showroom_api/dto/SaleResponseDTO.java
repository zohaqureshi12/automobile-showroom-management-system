package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleResponseDTO {
    private Long id;
    private Double target;
    private Integer quantity;
    private LocalDate date;
    private String offer;
    private Long vehicleId;
    private String vehicleNumberPlate;
    private Long customerId;
    private String customerName;
}
