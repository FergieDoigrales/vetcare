package org.fergoeqs.coursework.services;

import org.fergoeqs.coursework.dto.TreatmentDTO;
import org.fergoeqs.coursework.models.Treatment;
import org.fergoeqs.coursework.repositories.TreatmentRepository;
import org.fergoeqs.coursework.utils.Mappers.TreatmentMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TreatmentService {
    private final TreatmentRepository treatmentRepository;
    private final TreatmentMapper treatmentMapper;
    private final DiagnosisService diagnosisService;
    private final PetsService petsService;

    public TreatmentService(TreatmentRepository treatmentRepository, TreatmentMapper treatmentMapper,
                            DiagnosisService diagnosisService, PetsService petsService) {
        this.treatmentRepository = treatmentRepository;
        this.treatmentMapper = treatmentMapper;
        this.diagnosisService = diagnosisService;
        this.petsService = petsService;
    }

    public Treatment findTreatmentById(Long id) {
        return treatmentRepository.findById(id).orElse(null);
    }

    public List<Treatment> findByPetIdAndIsCompletedFalse(Long petId) {
        return treatmentRepository.findAllByPetIdAndIsCompletedFalse(petId);
    }

    public List<Treatment> findByPetId(Long petId) {
        return treatmentRepository.findAllByPetId(petId);
    }

    public Treatment save(TreatmentDTO treatmentDTO) {
        return treatmentRepository.save(setRelativeFields(treatmentMapper.fromDTO(treatmentDTO), treatmentDTO));
    }

    public Treatment update(TreatmentDTO treatmentDTO, Long id) {
        Treatment treatment = treatmentRepository.findById(id).orElse(null);
        assert treatment != null;
        treatmentMapper.updateTreatmentFromDTO(treatmentDTO, treatment);
        return treatmentRepository.save(setRelativeFields(treatment, treatmentDTO));
    }

    public void deleteTreatmentById(Long id) {
        treatmentRepository.deleteById(id);
    }

    private Treatment setRelativeFields(Treatment treatment, TreatmentDTO treatmentDTO) {
        treatment.setDiagnosis(diagnosisService.getDiagnosisById(treatmentDTO.diagnosis()));
        treatment.setPet(petsService.findPetById(treatmentDTO.pet()));
        return treatment;
    }


}
