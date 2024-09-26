
# Decentralized Elderly Care and Health Management System

This project is a decentralized platform built on the Internet Computer for managing elderly care and health records. It allows users to register as elderly individuals, caregivers, or healthcare providers and manage user profiles, health records, medication reminders, and virtual consultations. The platform ensures robust access control and user management.

## Enums

The system uses several enums for various health and fitness data:

- **UserType**: 
  - `Elderly`
  - `Caregiver`
  - `HealthcareProvider`
- **HealthStatus**: 
  - `Stable`
  - `Critical`
- **MealType**: 
  - `Breakfast`
  - `Lunch`
  - `Dinner`
- **ExerciseType**: 
  - `Cardio`
  - `Strength`
  - `Flexibility`
- **Intensity**: 
  - `Low`
  - `Medium`
  - `High`
- **Mood**: 
  - `Happy`
  - `Sad`
  - `Anxious`
- **StressLevel**: 
  - `Low`
  - `Medium`
  - `High`

## Structs

The system defines multiple data structures (records) for various health, fitness, and user-related information:

- **User**: Stores user details such as ID, name, contact, user type, and owner (Principal).
- **HealthRecord**: Records user health data like heart rate, blood pressure, activity level, and health status.
- **MedicationReminder**: Tracks medication reminders for users, including dosage, schedule, and medication name.
- **VirtualConsultation**: Stores data for scheduling virtual consultations between users and healthcare providers.
- **DietRecord**: Records user diet information, including meal type, food items, and calories.
- **ExerciseRecommendation**: Tracks exercise recommendations such as exercise type, intensity, and duration.
- **MentalHealthRecord**: Records mental health data, including mood, stress level, and additional notes.
- **FitnessChallenge**: Stores information on fitness challenges such as the start and end dates and descriptions.
- **FitnessChallengeParticipant**: Tracks participant progress in fitness challenges.

## Storage

The system uses `StableBTreeMap` for storing data related to:

- Users
- Health Records
- Medication Reminders
- Virtual Consultations
- Diet Records
- Exercise Recommendations
- Mental Health Records
- Fitness Challenges
- Fitness Challenge Participants

## Functions

### User Management

- **`createUser`**: Creates a new user profile. Validates email format and ensures uniqueness.
- **`getUserById`**: Retrieves user profile by ID.
- **`getUserByPrincipal`**: Fetches user profile by the calling principal.
- **`getAllUsers`**: Retrieves all user profiles.

### Health Records

- **`createHealthRecord`**: Creates a new health record for a user.
- **`getHealthRecordById`**: Retrieves a health record by ID.
- **`getAllHealthRecords`**: Retrieves all health records.

### Medication Reminders

- **`createMedicationReminder`**: Creates a new medication reminder for a user.
- **`getMedicationReminderById`**: Retrieves a medication reminder by ID.
- **`getMedicationReminderByUserId`**: Retrieves medication reminders by user ID.
- **`getAllMedicationReminders`**: Retrieves all medication reminders.

### Virtual Consultations

- **`createVirtualConsultation`**: Schedules a new virtual consultation for a user.
- **`getVirtualConsultationById`**: Retrieves virtual consultation by ID.
- **`getAllVirtualConsultations`**: Retrieves all virtual consultations.

### Diet Records

- **`createDietRecord`**: Creates a new diet record for a user.
- **`getDietRecordById`**: Retrieves diet record by ID.
- **`getAllDietRecords`**: Retrieves all diet records.

### Exercise Recommendations

- **`createExerciseRecommendation`**: Creates an exercise recommendation for a user.
- **`getExerciseRecommendationById`**: Retrieves exercise recommendation by ID.
- **`getAllExerciseRecommendations`**: Retrieves all exercise recommendations.

### Mental Health Records

- **`createMentalHealthRecord`**: Records mental health data for a user.
- **`getMentalHealthRecordById`**: Retrieves mental health record by ID.
- **`getAllMentalHealthRecords`**: Retrieves all mental health records.

### Fitness Challenges

- **`createFitnessChallenge`**: Creates a new fitness challenge.
- **`getFitnessChallengeById`**: Retrieves fitness challenge by ID.
- **`getAllFitnessChallenges`**: Retrieves all fitness challenges.

### Fitness Challenge Participants

- **`createFitnessChallengeParticipant`**: Registers a user for a fitness challenge.
- **`getFitnessChallengeParticipantById`**: Retrieves participant progress by ID.
- **`getAllFitnessChallengeParticipants`**: Retrieves all fitness challenge participants.



## Things to be explained in the course:
1. What is Ledger? More details here: https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/
2. What is Internet Identity? More details here: https://internetcomputer.org/internet-identity
3. What is Principal, Identity, Address? https://internetcomputer.org/internet-identity | https://yumimarketplace.medium.com/whats-the-difference-between-principal-id-and-account-id-3c908afdc1f9
4. Canister-to-canister communication and how multi-canister development is done? https://medium.com/icp-league/explore-backend-multi-canister-development-on-ic-680064b06320

## How to deploy canisters implemented in the course

### Ledger canister
`./deploy-local-ledger.sh` - deploys a local Ledger canister. IC works differently when run locally so there is no default network token available and you have to deploy it yourself. Remember that it's not a token like ERC-20 in Ethereum, it's a native token for ICP, just deployed separately.
This canister is described in the `dfx.json`:
```
	"ledger_canister": {
  	"type": "custom",
  	"candid": "https://raw.githubusercontent.com/dfinity/ic/928caf66c35627efe407006230beee60ad38f090/rs/rosetta-api/icp_ledger/ledger.did",
  	"wasm": "https://download.dfinity.systems/ic/928caf66c35627efe407006230beee60ad38f090/canisters/ledger-canister.wasm.gz",
  	"remote": {
    	"id": {
      	"ic": "ryjl3-tyaaa-aaaaa-aaaba-cai"
    	}
  	}
	}
```
`remote.id.ic` - that is the principal of the Ledger canister and it will be available by this principal when you work with the ledger.

Also, in the scope of this script, a minter identity is created which can be used for minting tokens
for the testing purposes.
Additionally, the default identity is pre-populated with 1000_000_000_000 e8s which is equal to 10_000 * 10**8 ICP.
The decimals value for ICP is 10**8.

List identities:
`dfx identity list`

Switch to the minter identity:
`dfx identity use minter`

Transfer ICP:
`dfx ledger transfer <ADDRESS>  --memo 0 --icp 100 --fee 0`
where:
 - `--memo` is some correlation id that can be set to identify some particular transactions (we use that in the marketplace canister).
 - `--icp` is the transfer amount
 - `--fee` is the transaction fee. In this case it's 0 because we make this transfer as the minter idenity thus this transaction is of type MINT, not TRANSFER.
 - `<ADDRESS>` is the address of the recipient. To get the address from the principal, you can use the helper function from the marketplace canister - `getAddressFromPrincipal(principal: Principal)`, it can be called via the Candid UI.


### Internet identity canister

`dfx deploy internet_identity` - that is the canister that handles the authentication flow. Once it's deployed, the `js-agent` library will be talking to it to register identities. There is UI that acts as a wallet where you can select existing identities
or create a new one.

