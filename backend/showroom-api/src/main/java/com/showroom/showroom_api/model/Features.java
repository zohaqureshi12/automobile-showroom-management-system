package com.showroom.showroom_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "features")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"vehicle"})
@EqualsAndHashCode(exclude = {"vehicle"})
public class Features {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "engine_capacity")
    private String engineCapacity;

    @Column
    private String mileage;

    @Column
    private String colour;

    @Column(name = "seat_capacity")
    private Integer seatCapacity;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "pollution_control")
    private String pollutionControl;

    @Column(name = "safety_features")
    private String safetyFeatures;

    @OneToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id", unique = true, nullable = false)
    private Vehicle vehicle;
}
