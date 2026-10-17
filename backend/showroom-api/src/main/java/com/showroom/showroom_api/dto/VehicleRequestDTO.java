package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequestDTO {
    private String type;
    private String brand;
    private String colour;
    private String numberPlate;
    private Double cost;
}
