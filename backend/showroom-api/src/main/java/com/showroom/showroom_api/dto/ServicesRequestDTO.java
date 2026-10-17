package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicesRequestDTO {
    private Long showroomId;
    private Long customerId;
    private String issue;
    private Double price;
    private LocalDate entryDate;
    private LocalDate deliveryDate;
}
