package com.showroom.showroom_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "taxes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"vehicle"})
@EqualsAndHashCode(exclude = {"vehicle"})
public class Tax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_tax")
    private Double vehicleTax;

    @Column(name = "road_tax")
    private Double roadTax;

    @Column
    private Boolean paid;

    @OneToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id", unique = true, nullable = false)
    private Vehicle vehicle;
}
