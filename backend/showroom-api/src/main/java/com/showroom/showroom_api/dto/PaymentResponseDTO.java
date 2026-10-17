package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    private Long id;
    private Long customerId;
    private Long saleId;
    private String method;
    private Double amount;
    private LocalDate paymentDate;
}
