package com.showroom.showroom_api.service;

import com.showroom.showroom_api.dto.FeaturesDTO;
import com.showroom.showroom_api.dto.InsuranceDTO;
import com.showroom.showroom_api.dto.TaxDTO;
import com.showroom.showroom_api.dto.VehicleDetailResponseDTO;
import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Features;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.FeaturesRepository;
import com.showroom.showroom_api.repository.InsuranceRepository;
import com.showroom.showroom_api.repository.SalesRepository;
import com.showroom.showroom_api.repository.ShowroomRepository;
import com.showroom.showroom_api.repository.TaxRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ShowroomRepository showroomRepository;
    private final FeaturesRepository featuresRepository;
    private final TaxRepository taxRepository;
    private final InsuranceRepository insuranceRepository;
    private final SalesRepository salesRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public VehicleDetailResponseDTO getVehicleFullDetails(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        Tax tax = vehicle.getTax();
        if (tax == null) {
            tax = taxRepository.findByVehicle_Id(id).orElse(null);
        }

        Insurance insurance = vehicle.getInsurance();
        if (insurance == null) {
            insurance = insuranceRepository.findByVehicle_Id(id).orElse(null);
        }

        Features features = vehicle.getFeatures();
        if (features == null) {
            features = featuresRepository.findByVehicle_Id(id).orElse(null);
        }

        FeaturesDTO featuresDTO = features != null ? FeaturesDTO.builder()
                .id(features.getId())
                .engineCapacity(features.getEngineCapacity())
                .mileage(features.getMileage())
                .colour(features.getColour())
                .seatCapacity(features.getSeatCapacity())
                .fuelType(features.getFuelType())
                .pollutionControl(features.getPollutionControl())
                .safetyFeatures(features.getSafetyFeatures())
                .vehicleId(vehicle.getId())
                .build() : null;

        TaxDTO taxDTO = tax != null ? TaxDTO.builder()
                .id(tax.getId())
                .vehicleTax(tax.getVehicleTax())
                .roadTax(tax.getRoadTax())
                .paid(tax.getPaid())
                .vehicleId(vehicle.getId())
                .build() : null;

        InsuranceDTO insuranceDTO = insurance != null ? InsuranceDTO.builder()
                .id(insurance.getId())
                .expiryDate(insurance.getExpiryDate())
                .familyDetails(insurance.getFamilyDetails())
                .bankDetails(insurance.getBankDetails())
                .vehicleId(vehicle.getId())
                .build() : null;

        return VehicleDetailResponseDTO.builder()
                .id(vehicle.getId())
                .type(vehicle.getType())
                .brand(vehicle.getBrand())
                .colour(vehicle.getColour())
                .numberPlate(vehicle.getNumberPlate())
                .cost(vehicle.getCost())
                .showroomId(vehicle.getShowroom() != null ? vehicle.getShowroom().getId() : null)
                .showroomName(vehicle.getShowroom() != null ? vehicle.getShowroom().getName() : null)
                .features(featuresDTO)
                .tax(taxDTO)
                .insurance(insuranceDTO)
                .build();
    }

    public List<Vehicle> getVehiclesByShowroom(Long showroomId) {
        return vehicleRepository.findByShowroom_Id(showroomId);
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        Long showroomId = (vehicle.getShowroom() != null) ? vehicle.getShowroom().getId() : null;
        return createVehicle(showroomId, vehicle);
    }

    @Transactional
    public Vehicle createVehicle(Long showroomId, Vehicle vehicle) {
        Long targetShowroomId = showroomId;
        if (targetShowroomId == null && vehicle.getShowroom() != null) {
            targetShowroomId = vehicle.getShowroom().getId();
        }

        if (targetShowroomId != null) {
            final Long lookupId = targetShowroomId;
            Showroom showroom = showroomRepository.findById(lookupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + lookupId));
            vehicle.setShowroom(showroom);
        } else if (vehicle.getShowroom() == null) {
            throw new BadRequestException("Showroom ID must be provided to create a vehicle.");
        }

        // Ensure numberPlate has whitespace trimmed if needed
        if (vehicle.getNumberPlate() != null) {
            vehicle.setNumberPlate(vehicle.getNumberPlate().trim());
        }

        if (vehicle.getNumberPlate() != null && vehicleRepository.existsByNumberPlate(vehicle.getNumberPlate())) {
            throw new BadRequestException("Vehicle with number plate '" + vehicle.getNumberPlate() + "' already exists.");
        }

        // Ensure version is initialized to 0 if null
        if (vehicle.getVersion() == null) {
            vehicle.setVersion(0);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle details) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setType(details.getType());
        vehicle.setBrand(details.getBrand());
        vehicle.setColour(details.getColour());
        if (details.getNumberPlate() != null) {
            vehicle.setNumberPlate(details.getNumberPlate().trim());
        }
        vehicle.setCost(details.getCost());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        if (salesRepository.existsByVehicle_Id(id)) {
            throw new BadRequestException("Cannot delete vehicle with id " + id + " because it is linked to a completed sale record.");
        }

        // Clean up dependent 1:1 records before deletion
        taxRepository.findByVehicle_Id(id).ifPresent(taxRepository::delete);
        insuranceRepository.findByVehicle_Id(id).ifPresent(insuranceRepository::delete);
        featuresRepository.findByVehicle_Id(id).ifPresent(featuresRepository::delete);

        vehicleRepository.delete(vehicle);
    }
}
