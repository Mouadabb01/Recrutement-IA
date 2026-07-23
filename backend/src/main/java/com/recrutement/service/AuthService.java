package com.recrutement.service;

import com.recrutement.dto.JwtResponse;
import com.recrutement.dto.LoginRequest;
import com.recrutement.dto.RegisterRequest;
import com.recrutement.model.*;
import com.recrutement.repository.CandidateRepository;
import com.recrutement.repository.CompanyRepository;
import com.recrutement.repository.UserRepository;
import com.recrutement.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public void registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        Role userRole = Role.valueOf(registerRequest.getRole().toUpperCase());

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);

        if (userRole == Role.ROLE_CANDIDATE) {
            Candidate candidate = Candidate.builder()
                    .user(savedUser)
                    .experienceYears(0)
                    .skills("")
                    .resumeText("")
                    .build();
            candidateRepository.save(candidate);
        } else if (userRole == Role.ROLE_RECRUITER) {
            String companyName = registerRequest.getCompanyName();
            if (companyName == null || companyName.trim().isEmpty()) {
                companyName = savedUser.getName() + "'s Company";
            }
            Company company = Company.builder()
                    .user(savedUser)
                    .name(companyName)
                    .description("")
                    .website("")
                    .location("")
                    .build();
            companyRepository.save(company);
        }
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User userDetails = (User) authentication.getPrincipal();

        Long candidateId = null;
        Long companyId = null;

        if (userDetails.getRole() == Role.ROLE_CANDIDATE) {
            candidateId = candidateRepository.findByUserId(userDetails.getId())
                    .map(Candidate::getId)
                    .orElse(null);
        } else if (userDetails.getRole() == Role.ROLE_RECRUITER) {
            companyId = companyRepository.findByUserId(userDetails.getId())
                    .map(Company::getId)
                    .orElse(null);
        }

        return JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole().name())
                .candidateId(candidateId)
                .companyId(companyId)
                .build();
    }
}
