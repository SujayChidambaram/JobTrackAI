package JobTrack.AI.repository;

import JobTrack.AI.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InterviewRepository
        extends MongoRepository<Interview, String> {

    List<Interview> findByJobApplicationId(String jobApplicationId);
}