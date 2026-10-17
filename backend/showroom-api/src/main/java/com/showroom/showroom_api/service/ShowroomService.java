package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.repository.ShowroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ShowroomService {

    private final ShowroomRepository showroomRepository;

    public List<Showroom> getAllShowrooms() {
        return showroomRepository.findAll();
    }

    public Showroom getShowroomById(Long id) {
        return showroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + id));
    }

    @Transactional
    public Showroom createShowroom(Showroom showroom) {
        return showroomRepository.save(showroom);
    }

    @Transactional
    public Showroom updateShowroom(Long id, Showroom details) {
        Showroom showroom = showroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + id));

        showroom.setName(details.getName());
        showroom.setAddress(details.getAddress());
        showroom.setManager(details.getManager());
        showroom.setSalesExecutive(details.getSalesExecutive());

        return showroomRepository.save(showroom);
    }

    @Transactional
    public void deleteShowroom(Long id) {
        Showroom showroom = showroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + id));
        showroomRepository.delete(showroom);
    }
}
