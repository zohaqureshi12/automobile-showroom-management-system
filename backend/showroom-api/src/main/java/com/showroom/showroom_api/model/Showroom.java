package com.showroom.showroom_api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "showrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"vehicles", "services"})
@EqualsAndHashCode(exclude = {"vehicles", "services"})
public class Showroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String manager;

    @Column(name = "sales_executive")
    private String salesExecutive;

    @OneToMany(mappedBy = "showroom", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles;

    @OneToMany(mappedBy = "showroom", cascade = CascadeType.ALL)
    private List<Services> services;
}
