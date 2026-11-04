package JobTrack.AI.service;

import JobTrack.AI.exception.ResourceNotFoundException;
import JobTrack.AI.model.JobApplication;
import JobTrack.AI.repository.JobApplicationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public JobApplicationService(
            JobApplicationRepository jobApplicationRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    public JobApplication addApplication(JobApplication application) {
        return jobApplicationRepository.save(application);
    }

    public JobApplication getApplicationById(String id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job application not found with ID: " + id
                        ));
    }

    public JobApplication updateApplication(
            String id, JobApplication updatedApplication) {

        JobApplication application = getApplicationById(id);

        application.setCompanyName(updatedApplication.getCompanyName());
        application.setJobRole(updatedApplication.getJobRole());
        application.setStatus(updatedApplication.getStatus());
        application.setJobLocation(updatedApplication.getJobLocation());
        application.setApplicationDate(updatedApplication.getApplicationDate());

        return jobApplicationRepository.save(application);
    }

    public boolean deleteApplication(String id) {
        JobApplication application = getApplicationById(id);
        jobApplicationRepository.delete(application);
        return true;
    }
}