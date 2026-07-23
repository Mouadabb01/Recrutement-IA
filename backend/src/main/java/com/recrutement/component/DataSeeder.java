package com.recrutement.component;

import com.recrutement.model.*;
import com.recrutement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Si la base contient déjà les données de test, on ne fait rien
        if (userRepository.existsByEmail("yassine@recrut.ma")) {
            System.out.println("✅ Base de données déjà peuplée avec les données de test marocaines.");
            return;
        }

        System.out.println("⏳ Remplissage de la base de données avec des profils (Amine, Yassine, Meryem, Sofia, Ihssane)...");

        // 1. Créer l'Admin (Yassine)
        User admin = User.builder()
                .name("Yassine")
                .email("yassine@recrut.ma")
                .password(passwordEncoder.encode("yassine123"))
                .role(Role.ROLE_ADMIN)
                .build();
        userRepository.save(admin);

        // 2. Créer un Recruteur (Amine - OCP)
        User rec1 = User.builder()
                .name("Amine")
                .email("amine@ocp.ma")
                .password(passwordEncoder.encode("amine123"))
                .role(Role.ROLE_RECRUITER)
                .build();
        userRepository.save(rec1);

        Company ocp = new Company();
        ocp.setName("OCP Group");
        ocp.setLocation("Casablanca, Maroc");
        ocp.setWebsite("https://www.ocpgroup.ma");
        ocp.setDescription("Leader mondial sur le marché des phosphates et dérivés, engagé pour l'agriculture durable.");
        ocp.setUser(rec1);
        companyRepository.save(ocp);

        // 3. Créer un deuxième Recruteur (Sofia - Inwi)
        User rec2 = User.builder()
                .name("Sofia")
                .email("sofia@inwi.ma")
                .password(passwordEncoder.encode("sofia123"))
                .role(Role.ROLE_RECRUITER)
                .build();
        userRepository.save(rec2);

        Company inwi = new Company();
        inwi.setName("Inwi");
        inwi.setLocation("Casablanca, Maroc");
        inwi.setWebsite("https://inwi.ma");
        inwi.setDescription("Opérateur global de télécommunications au Maroc, innovant dans le digital.");
        inwi.setUser(rec2);
        companyRepository.save(inwi);

        // 4. Créer des Candidats (Meryem & Ihssane)
        User cand1 = User.builder()
                .name("Meryem")
                .email("meryem@gmail.com")
                .password(passwordEncoder.encode("meryem123"))
                .role(Role.ROLE_CANDIDATE)
                .build();
        userRepository.save(cand1);

        Candidate candidate1 = new Candidate();
        candidate1.setTitle("Développeuse Full-Stack Java/React");
        candidate1.setExperienceYears(4);
        candidate1.setSkills("Java, Spring Boot, React, SQL, Docker");
        candidate1.setResumeText("Je suis Meryem, développeuse passionnée par la création d'APIs robustes avec Java Spring Boot et d'interfaces modernes avec React. 4 ans d'expérience dans une agence web au Maroc où j'ai géré des déploiements sur Docker et AWS.");
        candidate1.setUser(cand1);
        candidateRepository.save(candidate1);

        User cand2 = User.builder()
                .name("Ihssane")
                .email("ihssane@gmail.com")
                .password(passwordEncoder.encode("ihssane123"))
                .role(Role.ROLE_CANDIDATE)
                .build();
        userRepository.save(cand2);

        Candidate candidate2 = new Candidate();
        candidate2.setTitle("Ingénieur DevOps");
        candidate2.setExperienceYears(6);
        candidate2.setSkills("Kubernetes, Terraform, AWS, CI/CD, Python");
        candidate2.setResumeText("Je suis Ihssane, Experte DevOps avec 6 ans d'expérience. Maîtrise des clusters Kubernetes, de l'infrastructure as code (Terraform) et de l'automatisation des pipelines GitLab CI.");
        candidate2.setUser(cand2);
        candidateRepository.save(candidate2);

        // 5. Créer des Offres d'emploi (OCP)
        JobOffer job1 = new JobOffer();
        job1.setTitle("Ingénieur Logiciel Backend (Java/Spring)");
        job1.setDescription("OCP Group recrute un développeur Backend expérimenté pour travailler sur nos systèmes internes critiques.");
        job1.setRequirements("Maîtrise de Java, Spring Boot, PostgreSQL et de l'architecture de micro-services. Expérience de 3 ans minimum.");
        job1.setLocation("Casablanca, Maroc (Hybride)");
        job1.setSalary("15 000 - 20 000 MAD / mois");
        job1.setCompany(ocp);
        jobOfferRepository.save(job1);

        JobOffer job2 = new JobOffer();
        job2.setTitle("Lead Frontend Developer (React)");
        job2.setDescription("Nous cherchons une experte React pour mener le développement de la nouvelle interface de nos outils internes.");
        job2.setRequirements("Expertise React, Vite, Redux. Sens de l'UX/UI. Expérience de management d'équipe est un plus.");
        job2.setLocation("Télétravail intégral");
        job2.setSalary("18 000 - 25 000 MAD / mois");
        job2.setCompany(ocp);
        jobOfferRepository.save(job2);

        // 6. Créer des Offres d'emploi (Inwi)
        JobOffer job3 = new JobOffer();
        job3.setTitle("Ingénieur DevOps (Azure/AWS)");
        job3.setDescription("Rejoignez l'équipe DevOps d'Inwi. Vous travaillerez sur l'automatisation et le déploiement de nos infrastructures télécoms dans le cloud.");
        job3.setRequirements("Forte expérience avec Kubernetes, Terraform et le scripting Python. Connaissance d'Azure ou AWS requise.");
        job3.setLocation("Casablanca, Maroc");
        job3.setSalary("16 000 - 22 000 MAD / mois");
        job3.setCompany(inwi);
        jobOfferRepository.save(job3);

        System.out.println("✅ Base de données remplie avec succès avec les profils de Meryem, Ihssane, Amine, Sofia et Yassine !");
    }
}
