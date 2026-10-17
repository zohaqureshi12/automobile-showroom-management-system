package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturesDTO {
    private Long id;
    private String engineCapacity;
    private String mileage;
    private String colour;
    private Integer seatCapacity;
    private String fuelType;
    private String pollutionControl;
    private String safetyFeatures;
    private Long vehicleId;
}
