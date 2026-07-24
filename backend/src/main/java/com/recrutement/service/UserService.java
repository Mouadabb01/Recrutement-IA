package com.recrutement.service;

import com.recrutement.model.Candidate;
import com.recrutement.model.Company;
import com.recrutement.model.Role;
import com.recrutement.model.User;
import com.recrutement.repository.CandidateRepository;
import com.recrutement.repository.CompanyRepository;
import com.recrutement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Delete associated entity to respect foreign keys and trigger cascade deletes
        if (user.getRole() == Role.ROLE_CANDIDATE) {
            Optional<Candidate> candidate = candidateRepository.findByUserId(id);
            candidate.ifPresent(c -> candidateRepository.delete(c));
        } else if (user.getRole() == Role.ROLE_RECRUITER) {
            Optional<Company> company = companyRepository.findByUserId(id);
            company.ifPresent(c -> companyRepository.delete(c));
        }

        // Finally, delete the user record
        userRepository.delete(user);
    }

    @Transactional
    public User updateAvatar(Long id, String avatarBase64) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setAvatarBase64(avatarBase64);
        return userRepository.save(user);
    }
}
