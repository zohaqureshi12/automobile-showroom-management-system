package com.showroom.showroom_api.config;

import com.showroom.showroom_api.model.*;
import com.showroom.showroom_api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final ShowroomRepository showroomRepository;
    private final VehicleRepository vehicleRepository;
    private final FeaturesRepository featuresRepository;
    private final TaxRepository taxRepository;
    private final InsuranceRepository insuranceRepository;
    private final CustomerRepository customerRepository;
    private final SalesRepository salesRepository;
    private final PaymentRepository paymentRepository;
    private final ServicesRepository servicesRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (showroomRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database with sample data...");

        // ─── 1. Showrooms ───────────────────────────────────────────────
        Showroom centralAutoHub = showroomRepository.save(Showroom.builder()
                .name("Central Auto Hub")
                .address("AB Road, Indore")
                .manager("Rajesh Sharma")
                .salesExecutive("Amit Verma")
                .build());

        Showroom apexMotors = showroomRepository.save(Showroom.builder()
                .name("Apex Motors")
                .address("MG Road, Indore")
                .manager("Priya Nair")
                .salesExecutive("Suresh Patel")
                .build());

        log.info("  ✓ 2 Showrooms created");

        // ─── 2. Vehicles ────────────────────────────────────────────────
        Vehicle hondaCity = vehicleRepository.save(Vehicle.builder()
                .type("Sedan")
                .brand("Honda City")
                .colour("White")
                .numberPlate("MP09AB1234")
                .cost(1500000.0)
                .showroom(centralAutoHub)
                .build());

        Vehicle hyundaiCreta = vehicleRepository.save(Vehicle.builder()
                .type("SUV")
                .brand("Hyundai Creta")
                .colour("Black")
                .numberPlate("MP09XY5678")
                .cost(1750000.0)
                .showroom(centralAutoHub)
                .build());

        Vehicle marutiSwift = vehicleRepository.save(Vehicle.builder()
                .type("Hatchback")
                .brand("Maruti Swift")
                .colour("Red")
                .numberPlate("MP09CD9012")
                .cost(850000.0)
                .showroom(apexMotors)
                .build());

        Vehicle tataNexon = vehicleRepository.save(Vehicle.builder()
                .type("EV")
                .brand("Tata Nexon EV")
                .colour("Blue")
                .numberPlate("MP09EF3456")
                .cost(1900000.0)
                .showroom(apexMotors)
                .build());

        log.info("  ✓ 4 Vehicles created");

        // ─── 3a. Features ───────────────────────────────────────────────
        featuresRepository.saveAll(List.of(
                Features.builder()
                        .engineCapacity("1498 cc")
                        .mileage("17.8 km/l")
                        .colour("White")
                        .seatCapacity(5)
                        .fuelType("Petrol")
                        .pollutionControl("BS6")
                        .safetyFeatures("6 Airbags, ABS, EBD, Lane Watch Camera")
                        .vehicle(hondaCity)
                        .build(),
                Features.builder()
                        .engineCapacity("1497 cc")
                        .mileage("16.8 km/l")
                        .colour("Black")
                        .seatCapacity(5)
                        .fuelType("Diesel")
                        .pollutionControl("BS6")
                        .safetyFeatures("6 Airbags, ABS, ESC, Hill Assist")
                        .vehicle(hyundaiCreta)
                        .build(),
                Features.builder()
                        .engineCapacity("1197 cc")
                        .mileage("22.38 km/l")
                        .colour("Red")
                        .seatCapacity(5)
                        .fuelType("Petrol")
                        .pollutionControl("BS6")
                        .safetyFeatures("2 Airbags, ABS, EBD, Rear Parking Sensors")
                        .vehicle(marutiSwift)
                        .build(),
                Features.builder()
                        .engineCapacity("Electric Motor 129 PS")
                        .mileage("312 km range")
                        .colour("Blue")
                        .seatCapacity(5)
                        .fuelType("Electric")
                        .pollutionControl("Zero Emission")
                        .safetyFeatures("6 Airbags, ABS, ESP, TPMS, ISOFIX")
                        .vehicle(tataNexon)
                        .build()
        ));

        log.info("  ✓ 4 Features records created");

        // ─── 3b. Tax ────────────────────────────────────────────────────
        taxRepository.saveAll(List.of(
                Tax.builder().vehicleTax(45000.0).roadTax(22500.0).paid(true).vehicle(hondaCity).build(),
                Tax.builder().vehicleTax(52500.0).roadTax(26250.0).paid(true).vehicle(hyundaiCreta).build(),
                Tax.builder().vehicleTax(25500.0).roadTax(12750.0).paid(false).vehicle(marutiSwift).build(),
                Tax.builder().vehicleTax(19000.0).roadTax(9500.0).paid(true).vehicle(tataNexon).build()
        ));

        log.info("  ✓ 4 Tax records created");

        // ─── 3c. Insurance ──────────────────────────────────────────────
        insuranceRepository.saveAll(List.of(
                Insurance.builder()
                        .expiryDate(LocalDate.of(2027, 6, 15))
                        .familyDetails("Rohan Verma, Spouse: Neha Verma")
                        .bankDetails("SBI A/C **** 4321")
                        .vehicle(hondaCity)
                        .build(),
                Insurance.builder()
                        .expiryDate(LocalDate.of(2027, 9, 20))
                        .familyDetails("Corporate Fleet — Central Auto Hub")
                        .bankDetails("HDFC A/C **** 8765")
                        .vehicle(hyundaiCreta)
                        .build(),
                Insurance.builder()
                        .expiryDate(LocalDate.of(2027, 3, 10))
                        .familyDetails("Ananya Singh, Father: Rajendra Singh")
                        .bankDetails("ICICI A/C **** 5678")
                        .vehicle(marutiSwift)
                        .build(),
                Insurance.builder()
                        .expiryDate(LocalDate.of(2028, 1, 5))
                        .familyDetails("Vikram Rathore, Spouse: Meera Rathore")
                        .bankDetails("Axis A/C **** 9012")
                        .vehicle(tataNexon)
                        .build()
        ));

        log.info("  ✓ 4 Insurance records created");

        // ─── 4. Customers ───────────────────────────────────────────────
        Customer rohan = customerRepository.save(Customer.builder()
                .firstName("Rohan")
                .middleName("Kumar")
                .lastName("Verma")
                .phone("9876543210")
                .email("rohan@example.com")
                .address("Vijay Nagar, Indore")
                .build());

        Customer ananya = customerRepository.save(Customer.builder()
                .firstName("Ananya")
                .middleName("")
                .lastName("Singh")
                .phone("9823456781")
                .email("ananya@example.com")
                .address("Palasia, Indore")
                .build());

        Customer vikram = customerRepository.save(Customer.builder()
                .firstName("Vikram")
                .middleName("Pratap")
                .lastName("Rathore")
                .phone("9812345678")
                .email("vikram@example.com")
                .address("Rau, Indore")
                .build());

        log.info("  ✓ 3 Customers created");

        // ─── 5. Sale + Payment ──────────────────────────────────────────
        Sales sale = salesRepository.save(Sales.builder()
                .target(1500000.0)
                .quantity(1)
                .date(LocalDate.of(2026, 9, 15))
                .offer("Diwali Special — Free Accessories Worth ₹25,000")
                .vehicle(hondaCity)
                .customer(rohan)
                .build());

        paymentRepository.save(Payment.builder()
                .method(PaymentMethod.LOAN)
                .amount(1500000.0)
                .paymentDate(LocalDate.of(2026, 9, 16))
                .customer(rohan)
                .sale(sale)
                .build());

        log.info("  ✓ 1 Sale + 1 Payment created");

        // ─── 6. Service Record ──────────────────────────────────────────
        servicesRepository.save(Services.builder()
                .issue("First periodic maintenance")
                .price(2500.0)
                .entryDate(LocalDate.of(2026, 10, 1))
                .deliveryDate(LocalDate.of(2026, 10, 3))
                .showroom(centralAutoHub)
                .customer(ananya)
                .build());

        log.info("  ✓ 1 Service record created");
        log.info("Database seeding complete!");
    }
}
