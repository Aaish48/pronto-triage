import pandas as pd
import numpy as np

# Number of patient records to generate
num_records = 5000

# Define possible symptoms
symptoms = [
    'fever', 'cough', 'shortness_of_breath', 'chest_pain', 'headache',
    'sore_throat', 'fatigue', 'nausea', 'abdominal_pain', 'dizziness'
]

# --- Data Generation ---
data = {
    # Demographics
    'age': np.random.randint(1, 95, size=num_records),
    
    # Vital Signs
    'heart_rate': np.random.randint(50, 180, size=num_records),
    'systolic_bp': np.random.randint(80, 200, size=num_records), # Systolic Blood Pressure
    'temperature': np.round(np.random.uniform(36.0, 40.5, size=num_records), 1),
    'oxygen_saturation': np.random.randint(85, 101, size=num_records),
}

# Add symptoms as binary flags (1 for present, 0 for absent)
for symptom in symptoms:
    data[symptom] = np.random.choice([0, 1], size=num_records, p=[0.7, 0.3]) # 30% chance of having a symptom

# Create a DataFrame
df = pd.DataFrame(data)

# --- Triage Logic (Rule-based for synthetic data generation) ---
# This part assigns a triage level based on the generated data.
# This simulates how a real nurse would make a decision.

def assign_triage_level(row):
    score = 0
    
    # Critical conditions (Level 1 & 2)
    if row['chest_pain'] == 1 and row['age'] > 40: score += 4
    if row['shortness_of_breath'] == 1: score += 4
    if row['oxygen_saturation'] < 92: score += 4
    if row['systolic_bp'] > 180 or row['systolic_bp'] < 90: score += 3
    if row['heart_rate'] > 140 or row['heart_rate'] < 55: score += 3
    
    # Urgent conditions (Level 3)
    if row['abdominal_pain'] == 1 and row['fever'] == 1: score += 2
    if row['temperature'] > 39.5: score += 2
    if row['headache'] == 1 and row['dizziness'] == 1: score += 2

    # Less urgent conditions (Level 4 & 5)
    if row['cough'] == 1 or row['sore_throat'] == 1: score += 1

    # Assign Triage Level based on score
    if score >= 6:
        return 1 # Resuscitation / Emergent
    elif score >= 4:
        return 2 # Emergent
    elif score >= 3:
        return 3 # Urgent
    elif score >= 1:
        return 4 # Less Urgent
    else:
        return 5 # Non-urgent

# Apply the logic to create the target variable 'triage_level'
df['triage_level'] = df.apply(assign_triage_level, axis=1)

# Save to CSV
df.to_csv('triage_data.csv', index=False)

print(f"Successfully generated 'triage_data.csv' with {num_records} records.")
print("\nFirst 5 rows of the dataset:")
print(df.head())

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# --- 1. Load and Explore the Data ---
df = pd.read_csv('triage_data.csv')

print("--- Data Info ---")
df.info()

print("\n--- First 5 Rows ---")
print(df.head())

# --- 2. Separate Features (X) and Target (y) ---
# X contains all columns EXCEPT 'triage_level'
X = df.drop('triage_level', axis=1) 
# y contains ONLY the 'triage_level' column
y = df['triage_level']

# The triage levels in the CSV are 1, 2, 3, 4, 5.
# Neural networks work best with labels starting from 0.
# So we subtract 1 to make them 0, 1, 2, 3, 4.
y = y - 1 

print("\n--- Shape of Features (X) and Target (y) ---")
print("X shape:", X.shape)
print("y shape:", y.shape)

# --- 3. Split Data for Training and Testing ---
# We'll use 80% of the data for training and 20% for testing.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42, # Ensures the split is the same every time
    stratify=y # Ensures train and test sets have similar proportions of each triage level
)

print("\n--- Shape of Training and Testing Sets ---")
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)

# --- 4. Scale Numerical Features ---
# We only want to scale columns with a wide range of values (like age, heart_rate),
# not the symptom columns which are already 0 or 1.
numerical_features = ['age', 'heart_rate', 'systolic_bp', 'temperature', 'oxygen_saturation']

# Initialize the scaler
scaler = StandardScaler()

# Fit the scaler ONLY on the training data's numerical features
X_train[numerical_features] = scaler.fit_transform(X_train[numerical_features])

# Transform the test data using the SAME scaler fitted on the training data
X_test[numerical_features] = scaler.transform(X_test[numerical_features])

print("\n--- First 5 Rows of Processed Training Data (X_train) ---")
print(X_train.head())

print("\nData preprocessing complete!")

# For future steps, we will use X_train, y_train, X_test, and y_test.

import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# --- STEP 2 (FROM PREVIOUSLY) ---
# --- 1. Load and Prepare Data ---
df = pd.read_csv('triage_data.csv')
X = df.drop('triage_level', axis=1)
y = df['triage_level'] - 1 # Labels from 0-4

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

numerical_features = ['age', 'heart_rate', 'systolic_bp', 'temperature', 'oxygen_saturation']
scaler = StandardScaler()
X_train[numerical_features] = scaler.fit_transform(X_train[numerical_features])
X_test[numerical_features] = scaler.transform(X_test[numerical_features])
# --- END OF STEP 2 ---


# --- STEP 3: BUILD AND TRAIN THE MODEL ---
# --- 1. Define the Model Architecture ---
# We'll build the model layer by layer
model = tf.keras.Sequential([
    # The input layer: shape must match the number of feature columns
    tf.keras.layers.Input(shape=(X_train.shape[1],)),
    
    # First hidden layer: 128 neurons, 'relu' activation function
    tf.keras.layers.Dense(128, activation='relu'),
    
    # Second hidden layer: 64 neurons
    tf.keras.layers.Dense(64, activation='relu'),
    
    # Output layer: 5 neurons (one for each triage level), 'softmax' for probabilities
    tf.keras.layers.Dense(5, activation='softmax')
])

# Print a summary of the model's architecture
model.summary()

# --- 2. Compile the Model ---
# This configures the model for training
model.compile(
    optimizer='adam', # Adam is a popular and effective optimizer
    loss='sparse_categorical_crossentropy', # Use this loss function for integer-based classification labels
    metrics=['accuracy'] # We want to track the accuracy during training
)

# --- 3. Train the Model ---
print("\n--- Starting Model Training ---")
history = model.fit(
    X_train, 
    y_train,
    epochs=20, # An epoch is one full pass through the entire training dataset
    batch_size=32, # Process data in batches of 32
    validation_split=0.2 # Use 20% of training data for validation
)
print("--- Model Training Complete ---")

# We will evaluate and save the model in the next step

import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle # Used to save the scaler object

# --- STEP 2: DATA PREPARATION ---
df = pd.read_csv('triage_data.csv')
X = df.drop('triage_level', axis=1)
y = df['triage_level'] - 1

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

numerical_features = ['age', 'heart_rate', 'systolic_bp', 'temperature', 'oxygen_saturation']
scaler = StandardScaler()
X_train[numerical_features] = scaler.fit_transform(X_train[numerical_features])
X_test[numerical_features] = scaler.transform(X_test[numerical_features])

# --- STEP 3: MODEL TRAINING ---
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(5, activation='softmax')
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=20, batch_size=32, validation_split=0.2, verbose=0) # verbose=0 silences training output for this script

print("--- Model Training Complete ---")

# --- STEP 4: EVALUATE, SAVE, AND USE ---
# --- 1. Evaluate the Model ---
print("\n--- Evaluating Model on Test Data ---")
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy * 100:.2f}%")

# --- 2. Save the Model and the Scaler ---
# Save the trained neural network model
model.save('triage_model.keras')
print("\nModel saved as 'triage_model.keras'")

# Save the scaler object for later use
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print("Scaler saved as 'scaler.pkl'")


# --- 3. Make a Prediction on a Sample Patient ---
print("\n--- Making a Prediction on a New Sample Patient ---")
# Load the model and scaler back (to simulate a real application)
loaded_model = tf.keras.models.load_model('triage_model.keras')
with open('scaler.pkl', 'rb') as f:
    loaded_scaler = pickle.load(f)
    
# Triage levels are: 0=Emergent, 1=Emergent, 2=Urgent, 3=Less Urgent, 4=Non-urgent
# Remember to add 1 to the prediction to get the real triage level (1-5)
triage_map = {0: 'Level 1/2 (Emergent)', 1: 'Level 1/2 (Emergent)', 2: 'Level 3 (Urgent)', 3: 'Level 4 (Less Urgent)', 4: 'Level 5 (Non-urgent)'}


# Sample patient: 65-year-old with chest pain, high heart rate and BP. Expect a high priority.
sample_patient = pd.DataFrame([{
    'age': 65, 'heart_rate': 120, 'systolic_bp': 160, 'temperature': 37.1, 'oxygen_saturation': 95,
    'fever': 0, 'cough': 0, 'shortness_of_breath': 0, 'chest_pain': 1, 'headache': 0,
    'sore_throat': 0, 'fatigue': 1, 'nausea': 0, 'abdominal_pain': 0, 'dizziness': 0
}])

# IMPORTANT: Preprocess the sample patient data THE EXACT SAME WAY as the training data
sample_patient[numerical_features] = loaded_scaler.transform(sample_patient[numerical_features])

# Make the prediction
prediction_probabilities = loaded_model.predict(sample_patient)
predicted_class = np.argmax(prediction_probabilities, axis=1)[0]

print(f"\nSample Patient Data Processed: \n{sample_patient.head()}")
print(f"\nPrediction Probabilities: {prediction_probabilities}")
print(f"Predicted Triage Class (0-4): {predicted_class}")
print(f"Final Triage Assessment: {triage_map.get(predicted_class, 'Unknown')}")