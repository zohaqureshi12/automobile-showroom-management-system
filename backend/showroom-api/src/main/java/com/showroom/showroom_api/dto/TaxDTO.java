package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxDTO {
    private Long id;
    private Double vehicleTax;
    private Double roadTax;
    private Boolean paid;
    private Long vehicleId;
}
