package JobTrack.AI.repository;

import JobTrack.AI.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface JobApplicationRepository
        extends MongoRepository<JobApplication, String> {
}