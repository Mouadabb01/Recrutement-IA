package com.recrutement.service;

import com.recrutement.model.Candidate;
import com.recrutement.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Optional<Candidate> getCandidateById(Long id) {
        return candidateRepository.findById(id);
    }

    public Optional<Candidate> getCandidateByUserId(Long userId) {
        return candidateRepository.findByUserId(userId);
    }

    public Candidate updateCandidate(Long id, Candidate updatedCandidate) {
        Candidate existingCandidate = candidateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with id: " + id));

        existingCandidate.setTitle(updatedCandidate.getTitle());
        existingCandidate.setSkills(updatedCandidate.getSkills());
        existingCandidate.setExperienceYears(updatedCandidate.getExperienceYears());
        
        // If the client sends resume text, update it.
        if (updatedCandidate.getResumeText() != null) {
            existingCandidate.setResumeText(updatedCandidate.getResumeText());
        }

        return candidateRepository.save(existingCandidate);
    }
}
