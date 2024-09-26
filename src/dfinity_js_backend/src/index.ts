import {
  query,
  update,
  text,
  Null,
  Record,
  StableBTreeMap,
  Variant,
  Vec,
  None,
  Some,
  Ok,
  Err,
  ic,
  Principal,
  Opt,
  nat64,
  Duration,
  Result,
  bool,
  Canister,
} from "azle";

import { v4 as uuidv4 } from "uuid";

// Enums
const UserType = Variant({
  Elderly: text,
  Caregiver: text,
  HealthcareProvider: text,
});

const HealthStatus = Variant({
  Stable: Null,
  Critical: Null,
});

const MealType = Variant({
  Breakfast: Null,
  Lunch: Null,
  Dinner: Null,
});

const ExerciseType = Variant({
  Cardio: Null,
  Strength: Null,
  Flexibility: Null,
});

const Intensity = Variant({
  Low: Null,
  Medium: Null,
  High: Null,
});

const Mood = Variant({
  Happy: Null,
  Sad: Null,
  Anxious: Null,
});

const StressLevel = Variant({
  Low: Null,
  Medium: Null,
  High: Null,
});

// Structs
const User = Record({
  id: text,
  name: text,
  contact: text,
  user_type: UserType,
  owner: Principal,
  created_at: nat64,
});

const HealthRecord = Record({
  id: text,
  user_id: text,
  heart_rate: nat64,
  blood_pressure: text,
  activity_level: text,
  status: HealthStatus,
  recorded_at: nat64,
});

const MedicationReminder = Record({
  id: text,
  user_id: text,
  medication_name: text,
  dosage: text,
  schedule: text,
  created_at: nat64,
});

const VirtualConsultation = Record({
  id: text,
  user_id: text,
  provider_id: text,
  scheduled_at: nat64,
  status: text,
  created_at: nat64,
});

const DietRecord = Record({
  id: text,
  user_id: text,
  meal_type: MealType,
  food_items: text, // comma-separated list of food items
  calories: nat64,
  recorded_at: nat64,
});

const ExerciseRecommendation = Record({
  id: text,
  user_id: text,
  exercise_type: ExerciseType,
  duration: nat64, // in minutes
  intensity: Intensity,
  recommended_at: nat64,
});

const MentalHealthRecord = Record({
  id: text,
  user_id: text,
  mood: Mood,
  stress_level: StressLevel,
  notes: text, // Any additional notes
  recorded_at: nat64,
});

const FitnessChallenge = Record({
  id: text,
  name: text,
  description: text,
  start_date: nat64,
  end_date: nat64,
  created_at: nat64,
});

const FitnessChallengeParticipant = Record({
  id: text,
  challenge_id: text,
  user_id: text,
  progress: nat64,
  updated_at: nat64,
});

// Message Struct
const Message = Variant({
  Success: text,
  Error: text,
  NotFound: text,
  InvalidPayload: text,
  PaymentFailed: text,
  PaymentCompleted: text,
});

// Payloads

// User Profile Payload
const UserPayload = Record({
  name: text,
  contact: text,
  email: text,
  user_type: UserType,
});

// Health Record Payload
const HealthRecordPayload = Record({
  user_id: text,
  heart_rate: nat64,
  blood_pressure: text,
  activity_level: text,
  status: HealthStatus,
});

// Medication Reminder Payload
const MedicationReminderPayload = Record({
  user_id: text,
  medication_name: text,
  dosage: text,
  schedule: text,
});

// Virtual Consultation Payload
const VirtualConsultationPayload = Record({
  user_id: text,
  provider_id: text,
  scheduled_at: nat64,
  status: text,
});

// Diet Record Payload
const DietRecordPayload = Record({
  user_id: text,
  meal_type: MealType,
  food_items: text,
  calories: nat64,
});

// Exercise Recommendation Payload
const ExerciseRecommendationPayload = Record({
  user_id: text,
  exercise_type: ExerciseType,
  duration: nat64,
  intensity: Intensity,
});

// Mental Health Record Payload
const MentalHealthRecordPayload = Record({
  user_id: text,
  mood: Mood,
  stress_level: StressLevel,
  notes: text,
});

// Fitness Challenge Payload
const FitnessChallengePayload = Record({
  name: text,
  description: text,
  start_date: nat64,
  end_date: nat64,
});

// Fitness Challenge Participant Payload
const FitnessChallengeParticipantPayload = Record({
  challenge_id: text,
  user_id: text,
  progress: nat64,
});

// Storages
const usersStorage = StableBTreeMap(0, text, User);
const healthRecordsStorage = StableBTreeMap(0, text, HealthRecord);
const medicationRemindersStorage = StableBTreeMap(0, text, MedicationReminder);
const virtualConsultationsStorage = StableBTreeMap(
  0,
  text,
  VirtualConsultation
);
const dietRecordsStorage = StableBTreeMap(0, text, DietRecord);
const exerciseRecommendationsStorage = StableBTreeMap(
  0,
  text,
  ExerciseRecommendation
);
const mentalHealthRecordsStorage = StableBTreeMap(0, text, MentalHealthRecord);
const fitnessChallengesStorage = StableBTreeMap(0, text, FitnessChallenge);
const fitnessChallengeParticipantsStorage = StableBTreeMap(
  0,
  text,
  FitnessChallengeParticipant
);

// Functions
export default Canister({
  // Create User Profile with Validations
  createUser: update([UserPayload], Result(User, Message), (payload) => {
    // Validate the payload to ensure all required fields are present
    if (!payload.name || !payload.contact || !payload.email) {
      return Err({ InvalidPayload: "Required fields are missing." });
    }

    // Check for valid email format (simple regex example)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return Err({ InvalidPayload: "Invalid email format" });
    }

    // Ensure the email is unique
    const existingUser = usersStorage
      .values()
      .find((user) => user.email === payload.email);
    if (existingUser) {
      return Err({ InvalidPayload: "Email already exists." });
    }

    // Generate a new user ID
    const userId = uuidv4();

    // Create the user record
    const user = {
      id: userId,
      name: payload.name,
      contact: payload.contact,
      email: payload.email,
      user_type: payload.user_type,
      owner: ic.caller(),
      created_at: ic.time(),
    };

    // Store the user record
    usersStorage.insert(userId, user);
    return Ok(user); //  Return the user record
  }),

  // Get User Profile by ID
  getUserById: query([text], Result(User, Message), (userId) => {
    const userOpt = usersStorage.get(userId);

    if ("None" in userOpt) {
      return Err({ NotFound: "User not found" });
    }

    return Ok(userOpt["Some"]);
  }),

  // Fetch user profile by Principal
  getUserByPrincipal: query([], Result(User, Message), () => {
    const user = usersStorage.values().filter((user) => {
      return user.owner.toText === ic.caller().toText;
    });

    if (user.length === 0) {
      return Err({ NotFound: `User not found for principal ${ic.caller()}` });
    }

    return Ok(user[0]);
  }),

  // Get All Users
  getAllUsers: query([], Result(Vec(User), Message), () => {
    const users = usersStorage.values();
    if (users.length === 0) return Err({ NotFound: "No users found." });
    return Ok(users);
  }),

  // Create Health Record
  createHealthRecord: update(
    [HealthRecordPayload],
    Result(HealthRecord, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.heart_rate || !payload.blood_pressure) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        // Fix the check for None value
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new health record ID
      const healthRecordId = uuidv4();

      // Create the health record
      const healthRecord = {
        id: healthRecordId,
        ...payload,
        recorded_at: ic.time(),
      };

      // Store the health record
      healthRecordsStorage.insert(healthRecordId, healthRecord);

      // Return the health record
      return Ok(healthRecord);
    }
  ),

  // Get Health Record by ID
  getHealthRecordById: query([text], Result(HealthRecord, Message), (recordId) => {
    const recordOpt = healthRecordsStorage.get(recordId);
    if ("None" in recordOpt) {
      return Err({ NotFound: "Health record not found" });
    }
    return Ok(recordOpt["Some"]);
  }),

  // Get All Health Records
  getAllHealthRecords: query([], Result(Vec(HealthRecord), Message), () => {
    const healthRecords = healthRecordsStorage.values();
    if (healthRecords.length === 0) {
      return Err({ NotFound: "No health records found." });
    }
    return Ok(healthRecords);
  }),

  // Create Medication Reminder
  createMedicationReminder: update(
    [MedicationReminderPayload],
    Result(MedicationReminder, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.medication_name || !payload.dosage) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new medication reminder ID
      const reminderId = uuidv4();

      // Create the medication reminder
      const reminder = {
        id: reminderId,
        ...payload,
        created_at: ic.time(),
      };

      // Store the medication reminder
      medicationRemindersStorage.insert(reminderId, reminder);

      // Return the medication reminder
      return Ok(reminder);
    }
  ),

  // Get Medication Reminder by ID
  getMedicationReminderById: query(
    [text],
    Result(MedicationReminder, Message),
    (reminderId) => {
      const reminderOpt = medicationRemindersStorage.get(reminderId);
      if ("None" in reminderOpt) {
        return Err({ NotFound: "Medication reminder not found" });
      }
      return Ok(reminderOpt["Some"]);
    }
  ),

  // Get Medication Reminder by User ID
  getMedicationReminderByUserId: query(
    [text],
    Result(Vec(MedicationReminder), Message),
    (userId) => {
      const reminders = medicationRemindersStorage.values().filter((reminder) => {
        return reminder.user_id === userId;
      });

      if (reminders.length === 0) {
        return Err({ NotFound: "No medication reminders found." });
      }

      return Ok(reminders);
    }
  ),

  // Get All Medication Reminders
  getAllMedicationReminders: query(
    [],
    Result(Vec(MedicationReminder), text),
    () => {
      const reminders = medicationRemindersStorage.values();
      if (reminders.length === 0) return Err("No medication reminders found.");
      return Ok(reminders);
    }
  ),

  // Create Virtual Consultation
  createVirtualConsultation: update(
    [VirtualConsultationPayload],
    Result(VirtualConsultation, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.provider_id || !payload.scheduled_at) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Validate the provider ID to ensure it exists
      const provider = usersStorage.get(payload.provider_id);
      if (provider === None) {
        return Err({ InvalidPayload: "Provider not found." });
      }

      // Generate a new virtual consultation ID
      const consultationId = uuidv4();

      // Create the virtual consultation
      const consultation = {
        id: consultationId,
        ...payload,
        status: "Scheduled",
        created_at: ic.time(),
      };

      // Store the virtual consultation
      virtualConsultationsStorage.insert(consultationId, consultation);

      // Return the virtual consultation
      return Ok(consultation);
    }
  ),

  // Get Virtual Consultation by ID
  getVirtualConsultationById: query(
    [text],
    Result(VirtualConsultation, Message),
    (consultationId) => {
      const consultationOpt = virtualConsultationsStorage.get(consultationId);
      if ("None" in consultationOpt) {
        return Err({ NotFound: "Virtual consultation not found" });
      }
      return Ok(consultationOpt["Some"]);
    }
  ),

  // Get Virtual Consultation by User ID
  getVirtualConsultationByUserId: query(
    [text],
    Result(Vec(VirtualConsultation), Message),
    (userId) => {
      const consultations = virtualConsultationsStorage.values().filter(
        (consultation) => {
          return consultation.user_id === userId;
        }
      );

      if (consultations.length === 0) {
        return Err({ NotFound: "No virtual consultations found." });
      }

      return Ok(consultations);
    }
  ),

  // Get Virtual Consultation by Provider ID
  getVirtualConsultationByProviderId: query(
    [text],
    Result(Vec(VirtualConsultation), Message),
    (providerId) => {
      const consultations = virtualConsultationsStorage.values().filter(
        (consultation) => {
          return consultation.provider_id === providerId;
        }
      );

      if (consultations.length === 0) {
        return Err({ NotFound: "No virtual consultations found." });
      }

      return Ok(consultations);
    }
  ),

  // Get All Virtual Consultations
  getAllVirtualConsultations: query(
    [],
    Result(Vec(VirtualConsultation), text),
    () => {
      const consultations = virtualConsultationsStorage.values();
      if (consultations.length === 0)
        return Err("No virtual consultations found.");
      return Ok(consultations);
    }
  ),

  // Create Diet Record
  createDietRecord: update(
    [DietRecordPayload],
    Result(DietRecord, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.meal_type || !payload.food_items) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new diet record ID
      const dietRecordId = uuidv4();

      // Create the diet record
      const dietRecord = {
        id: dietRecordId,
        ...payload,
        recorded_at: ic.time(),
      };

      // Store the diet record
      dietRecordsStorage.insert(dietRecordId, dietRecord);

      // Return the diet record
      return Ok(dietRecord);
    }
  ),

  // Get Diet Record by ID
  getDietRecordById: query([text], Result(DietRecord, Message), (recordId) => {
    const recordOpt = dietRecordsStorage.get(recordId);
    if ("None" in recordOpt) {
      return Err({ NotFound: "Diet record not found" });
    }
    return Ok(recordOpt["Some"]);
  }),

  // Get Diet Record by User ID
  getDietRecordByUserId: query([text], Result(Vec(DietRecord), Message), (userId) => {
    const records = dietRecordsStorage.values().filter((record) => {
      return record.user_id === userId;
    });

    if (records.length === 0) {
      return Err({ NotFound: "No diet records found." });
    }

    return Ok(records);
  }),

  // Get All Diet Records
  getAllDietRecords: query([], Result(Vec(DietRecord), text), () => {
    const records = dietRecordsStorage.values();
    if (records.length === 0) return Err("No diet records found.");
    return Ok(records);
  }),

  // Create Exercise Recommendation
  createExerciseRecommendation: update(
    [ExerciseRecommendationPayload],
    Result(ExerciseRecommendation, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.exercise_type || !payload.duration) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new exercise recommendation ID
      const recommendationId = uuidv4();

      // Create the exercise recommendation
      const recommendation = {
        id: recommendationId,
        ...payload,
        recommended_at: ic.time(),
      };

      // Store the exercise recommendation
      exerciseRecommendationsStorage.insert(recommendationId, recommendation);

      // Return the exercise recommendation
      return Ok(recommendation);
    }
  ),

  // Get Exercise Recommendation by ID
  getExerciseRecommendationById: query(
    [text],
    Result(ExerciseRecommendation, Message),
    (recommendationId) => {
      const recommendationOpt = exerciseRecommendationsStorage.get(recommendationId);
      if ("None" in recommendationOpt) {
        return Err({ NotFound: "Exercise recommendation not found" });
      }
      return Ok(recommendationOpt["Some"]);
    }
  ),

  // Get Exercise Recommendation by User ID
  getExerciseRecommendationByUserId: query(
    [text],
    Result(Vec(ExerciseRecommendation), Message),
    (userId) => {
      const recommendations = exerciseRecommendationsStorage.values().filter(
        (recommendation) => {
          return recommendation.user_id === userId;
        }
      );

      if (recommendations.length === 0) {
        return Err({ NotFound: "No exercise recommendations found." });
      }

      return Ok(recommendations);
    }
  ),

  // Get Exercise Recommendations by exercise type
  getExerciseRecommendationsByType: query(
    [ExerciseType],
    Result(Vec(ExerciseRecommendation), Message),
    (exerciseType) => {
      const recommendations = exerciseRecommendationsStorage.values().filter(
        (recommendation) => {
          return recommendation.exercise_type === exerciseType;
        }
      );

      if (recommendations.length === 0) {
        return Err({ NotFound: "No exercise recommendations found." });
      }

      return Ok(recommendations);
    }
  ),

  // Get All Exercise Recommendations
  getAllExerciseRecommendations: query(
    [],
    Result(Vec(ExerciseRecommendation), text),
    () => {
      const recommendations = exerciseRecommendationsStorage.values();
      if (recommendations.length === 0)
        return Err("No exercise recommendations found.");
      return Ok(recommendations);
    }
  ),

  // Create Mental Health Record
  createMentalHealthRecord: update(
    [MentalHealthRecordPayload],
    Result(MentalHealthRecord, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.user_id || !payload.mood || !payload.stress_level) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new mental health record ID
      const mentalHealthRecordId = uuidv4();

      // Create the mental health record
      const mentalHealthRecord = {
        id: mentalHealthRecordId,
        ...payload,
        recorded_at: ic.time(),
      };

      // Store the mental health record
      mentalHealthRecordsStorage.insert(mentalHealthRecordId, mentalHealthRecord);

      // Return the mental health record
      return Ok(mentalHealthRecord);
    }
  ),

  // Get All Mental Health Records
  getAllMentalHealthRecords: query(
    [],
    Result(Vec(MentalHealthRecord), text),
    () => {
      const records = mentalHealthRecordsStorage.values();
      if (records.length === 0) return Err("No mental health records found.");
      return Ok(records);
    }
  ),

  // Create Fitness Challenge
  createFitnessChallenge: update(
    [FitnessChallengePayload],
    Result(FitnessChallenge, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.name || !payload.description || !payload.start_date || !payload.end_date) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Generate a new fitness challenge ID
      const challengeId = uuidv4();

      // Create the fitness challenge
      const challenge = {
        id: challengeId,
        ...payload,
        created_at: ic.time(),
      };

      // Store the fitness challenge
      fitnessChallengesStorage.insert(challengeId, challenge);

      // Return the fitness challenge
      return Ok(challenge);
    }
  ),

  // Get All Fitness Challenges
  getAllFitnessChallenges: query(
    [],
    Result(Vec(FitnessChallenge), text),
    () => {
      const challenges = fitnessChallengesStorage.values();
      if (challenges.length === 0) return Err("No fitness challenges found.");
      return Ok(challenges);
    }
  ),

  // Create Fitness Challenge Participant
  createFitnessChallengeParticipant: update(
    [FitnessChallengeParticipantPayload],
    Result(FitnessChallengeParticipant, Message),
    (payload) => {
      // Validate the payload to ensure all required fields are present
      if (!payload.challenge_id || !payload.user_id) {
        return Err({ InvalidPayload: "Required fields are missing." });
      }

      // Validate the challenge ID to ensure it exists
      const challenge = fitnessChallengesStorage.get(payload.challenge_id);
      if (challenge === None) {
        return Err({ InvalidPayload: "Challenge not found." });
      }

      // Validate the user ID to ensure it exists
      const user = usersStorage.get(payload.user_id);
      if (user === None) {
        return Err({ InvalidPayload: "User not found." });
      }

      // Generate a new fitness challenge participant ID
      const participantId = uuidv4();

      // Create the fitness challenge participant
      const participant = {
        id: participantId,
        ...payload,
        updated_at: ic.time(),
      };

      // Store the fitness challenge participant
      fitnessChallengeParticipantsStorage.insert(participantId, participant);

      // Return the fitness challenge participant
      return Ok(participant);
    }
  ),

  // Get All Fitness Challenge Participants
  getAllFitnessChallengeParticipants: query(
    [],
    Result(Vec(FitnessChallengeParticipant), text),
    () => {
      const participants = fitnessChallengeParticipantsStorage.values();
      if (participants.length === 0)
        return Err("No fitness challenge participants found.");
      return Ok(participants);
    }
  ),
});
