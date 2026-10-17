package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleCheckoutDTO {
    private Long vehicleId;
    private Long customerId;
    private Double target;
    private Integer quantity;
    private LocalDate date;
    private String offer;

    // Payment details
    private String paymentMethod;  // CASH, LOAN, CHEQUE
    private Double paymentAmount;
    private LocalDate paymentDate;
}
