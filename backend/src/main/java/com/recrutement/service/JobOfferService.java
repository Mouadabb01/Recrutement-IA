package com.recrutement.service;

import com.recrutement.model.Company;
import com.recrutement.model.JobOffer;
import com.recrutement.repository.CompanyRepository;
import com.recrutement.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobOfferService {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private CompanyRepository companyRepository;

    public JobOffer createJobOffer(JobOffer jobOffer, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + companyId));
        jobOffer.setCompany(company);
        return jobOfferRepository.save(jobOffer);
    }

    public List<JobOffer> getAllJobOffers() {
        return jobOfferRepository.findAll();
    }

    public Optional<JobOffer> getJobOfferById(Long id) {
        return jobOfferRepository.findById(id);
    }

    public List<JobOffer> getOffersByCompanyId(Long companyId) {
        return jobOfferRepository.findByCompanyId(companyId);
    }

    public JobOffer updateJobOffer(Long id, JobOffer updatedOffer) {
        JobOffer existingOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job offer not found with id: " + id));

        existingOffer.setTitle(updatedOffer.getTitle());
        existingOffer.setDescription(updatedOffer.getDescription());
        existingOffer.setRequirements(updatedOffer.getRequirements());
        existingOffer.setLocation(updatedOffer.getLocation());
        existingOffer.setSalary(updatedOffer.getSalary());

        return jobOfferRepository.save(existingOffer);
    }

    public void deleteJobOffer(Long id) {
        jobOfferRepository.deleteById(id);
    }
}
