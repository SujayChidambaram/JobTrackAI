package JobTrack.AI.controller;

import JobTrack.AI.model.JobApplication;
import JobTrack.AI.service.JobApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/jobs")
public class HelloController {

    private final JobApplicationService jobApplicationService;

    public HelloController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    // GET ALL APPLICATIONS
    @GetMapping
    public List<JobApplication> getAllApplications() {
        return jobApplicationService.getAllApplications();
    }

    // ADD APPLICATION
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication addApplication(
            @RequestBody JobApplication application) {
        return jobApplicationService.addApplication(application);
    }

    // GET APPLICATION BY ID
    @GetMapping("/{id}")
    public JobApplication getApplicationById(@PathVariable Long id) {
        return jobApplicationService.getApplicationById(id);
    }

    // UPDATE APPLICATION
    @PutMapping("/{id}")
    public JobApplication updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplication application) {
        return jobApplicationService.updateApplication(id, application);
    }

    // DELETE APPLICATION
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
    }
}