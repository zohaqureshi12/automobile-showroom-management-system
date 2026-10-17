package com.showroom.showroom_api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "insurances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"vehicle"})
@EqualsAndHashCode(exclude = {"vehicle"})
public class Insurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "family_details")
    private String familyDetails;

    @Column(name = "bank_details")
    private String bankDetails;

    @OneToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id", unique = true, nullable = false)
    private Vehicle vehicle;
}
