package com.showroom.showroom_api.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceDTO {
    private Long id;
    private LocalDate expiryDate;
    private String familyDetails;
    private String bankDetails;
    private Long vehicleId;
}
