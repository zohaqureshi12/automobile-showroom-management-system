package com.showroom.showroom_api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.showroom.showroom_api.model.Showroom;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class VehicleRequestDTO {
    private String type;
    private String brand;

    @JsonAlias("color")
    private String colour;

    private String numberPlate;
    private Double cost;

    private Long showroomId;
    private Showroom showroom;

    private Integer version;

    public void setColor(String color) {
        this.colour = color;
    }

    public String getColor() {
        return this.colour;
    }
}
