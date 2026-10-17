package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleCheckoutResponseDTO {
    private Long saleId;
    private Double target;
    private Integer quantity;
    private LocalDate date;
    private String offer;
    private Long vehicleId;
    private String vehicleNumberPlate;
    private Long customerId;
    private String customerName;

    // Linked payment
    private Long paymentId;
    private String paymentMethod;
    private Double paymentAmount;
    private LocalDate paymentDate;
}
