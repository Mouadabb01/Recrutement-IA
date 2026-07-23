package com.recrutement.service;

import com.recrutement.model.Application;
import com.recrutement.model.Candidate;
import com.recrutement.model.JobOffer;
import com.recrutement.repository.ApplicationRepository;
import com.recrutement.repository.CandidateRepository;
import com.recrutement.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private GeminiService geminiService;

    @Transactional
    public Application applyToJob(Long candidateId, Long jobOfferId) {
        // Prevent duplicate applications
        Optional<Application> existing = applicationRepository.findByCandidateIdAndJobOfferId(candidateId, jobOfferId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found with id: " + candidateId));

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new IllegalArgumentException("Job offer not found with id: " + jobOfferId));

        // Perform AI CV Matching
        GeminiService.MatchResult matchResult = geminiService.evaluateMatch(
                jobOffer.getTitle(),
                jobOffer.getDescription(),
                jobOffer.getRequirements(),
                candidate.getTitle(),
                candidate.getSkills(),
                candidate.getExperienceYears(),
                candidate.getResumeText()
        );

        Application application = Application.builder()
                .candidate(candidate)
                .jobOffer(jobOffer)
                .compatibilityScore(matchResult.getScore())
                .aiFeedback(matchResult.getFeedback())
                .status("PENDING")
                .build();

        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId);
    }

    public List<Application> getApplicationsByJobOffer(Long jobOfferId) {
        return applicationRepository.findByJobOfferId(jobOfferId);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application updateApplicationStatus(Long id, String status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + id));
        
        application.setStatus(status.toUpperCase());
        return applicationRepository.save(application);
    }
}
