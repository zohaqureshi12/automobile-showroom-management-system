package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Customer;
import com.showroom.showroom_api.model.Services;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.repository.CustomerRepository;
import com.showroom.showroom_api.repository.ServicesRepository;
import com.showroom.showroom_api.repository.ShowroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ServicesService {

    private final ServicesRepository servicesRepository;
    private final ShowroomRepository showroomRepository;
    private final CustomerRepository customerRepository;

    public List<Services> getAllServices() {
        return servicesRepository.findAll();
    }

    public Services getServiceById(Long id) {
        return servicesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    public List<Services> getServicesByShowroom(Long showroomId) {
        return servicesRepository.findByShowroom_Id(showroomId);
    }

    public List<Services> getServicesByCustomer(Long customerId) {
        return servicesRepository.findByCustomer_Id(customerId);
    }

    @Transactional
    public Services createService(Long showroomId, Long customerId, Services service) {
        Showroom showroom = showroomRepository.findById(showroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + showroomId));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        service.setShowroom(showroom);
        service.setCustomer(customer);
        return servicesRepository.save(service);
    }

    @Transactional
    public Services updateService(Long id, Services details) {
        Services service = servicesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        service.setIssue(details.getIssue());
        service.setPrice(details.getPrice());
        service.setEntryDate(details.getEntryDate());
        service.setDeliveryDate(details.getDeliveryDate());

        return servicesRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        Services service = servicesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        servicesRepository.delete(service);
    }
}
