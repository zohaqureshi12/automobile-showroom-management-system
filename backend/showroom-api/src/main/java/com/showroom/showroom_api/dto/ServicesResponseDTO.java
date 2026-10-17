package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicesResponseDTO {
    private Long id;
    private Long showroomId;
    private Long customerId;
    private String customerName;
    private String issue;
    private Double price;
    private LocalDate entryDate;
    private LocalDate deliveryDate;
}
