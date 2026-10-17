package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCatalogDTO {
    private Long id;
    private String type;
    private String brand;
    private String colour;
    private String numberPlate;
    private Double cost;
    private Long showroomId;
    private String showroomName;
    private Boolean isSold;
    private FeaturesDTO features;
    private TaxDTO tax;
    private InsuranceDTO insurance;
}
