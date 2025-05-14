import streamlit as st
import numpy as np
import requests
import re
import pickle
import time
from datetime import datetime
from tensorflow.keras.models import load_model
from typing import Tuple, List, Dict

# ================== CONFIGURATION ================== #
# API Keys (replace with your actual keys)
COHERE_API_KEY = "i5WSEd0yzRZVtyeZLe7CUueGk0YDPFuukFUbvvxb"
HF_API_TOKEN = "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"

# API URLs
COHERE_API_URL = "https://api.cohere.ai/v1/generate"
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

# Severity Configuration
BASE_SEVERITY = {
    'headache': 3, 'fever': 4, 'chest pain': 8, 'shortness of breath': 7,
    'nausea': 3, 'dizziness': 4, 'fatigue': 2, 'abdominal pain': 5,
    'vomiting': 4, 'cough': 3, 'sore throat': 2, '_default': 3
}

SEVERITY_WEIGHTS = {
    'mild': 0.5, 'slight': 0.5, 'moderate': 1.0, 'severe': 1.5,
    'extreme': 2.0, 'excruciating': 2.5, 'unbearable': 2.5
}

EMERGENCY_THRESHOLD = 10
EMERGENCY_KEYWORDS = [
    'can\'t breathe', 'passing out', 'unconscious',
    'severe bleeding', 'paralysis', 'sudden numbness'
]

# ================== STREAMLIT UI CONFIG ================== #
st.set_page_config(
    page_title="AI Medical Assistant",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .stApp {
    background-color: black !important;
}

    .stChatInput {
        bottom: 20px;
    }
    .severity-emergency {
        color: #ff0000;
        font-weight: bold;
    }
    .severity-severe {
        color: #ff6b00;
    }
    .severity-moderate {
        color: #ffb700;
    }
    .severity-mild {
        color: #00b32c;
    }
    .st-emotion-cache-4oy321 {
        padding: 1rem;
        border-radius: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# ================== CORE FUNCTIONS ================== #
@st.cache_resource
def load_models():
    """Load ML models with caching"""
    model = load_model('disease_prediction_model.h5')
    with open('label_encoder.pkl', 'rb') as f:
        encoder = pickle.load(f)
    with open('symptom_names.pkl', 'rb') as f:
        symptom_names = pickle.load(f)
    return model, encoder, symptom_names

def calculate_severity(symptom: str, description: str) -> Tuple[float, bool]:
    """Calculate severity score using S = B + (W × I)"""
    base = BASE_SEVERITY.get(symptom.lower(), BASE_SEVERITY['_default'])
    found_weights = [w for kw, w in SEVERITY_WEIGHTS.items() 
                    if kw in description.lower()]
    
    if found_weights:
        score = base + (max(found_weights) * len(found_weights))
    else:
        score = base
    
    is_emergency = (score >= EMERGENCY_THRESHOLD) or any(
        kw in description.lower() for kw in EMERGENCY_KEYWORDS
    )
    return score, is_emergency

def analyze_symptoms(symptoms: List[str], query: str) -> Dict:
    """Comprehensive symptom analysis with scoring"""
    results = {
        "overall_score": 0,
        "is_emergency": False,
        "details": []
    }
    
    for symptom in symptoms:
        score, emergency = calculate_severity(symptom, query)
        level = ("emergency" if emergency else
                "severe" if score >= 7 else
                "moderate" if score >= 4 else "mild")
        
        results["details"].append({
            "symptom": symptom,
            "base": BASE_SEVERITY.get(symptom.lower(), BASE_SEVERITY['_default']),
            "score": score,
            "level": level,
            "emergency": emergency
        })
        results["is_emergency"] = results["is_emergency"] or emergency
    
    if results["details"]:
        results["overall_score"] = sum(d['score'] for d in results["details"]) / len(results["details"])
    
    return results

def predict_condition(symptoms: List[str]) -> Tuple[str, float]:
    """Predict disease using ANN model"""
    input_vector = np.zeros(len(symptom_names))
    for symptom in symptoms:
        matches = [idx for idx, s in enumerate(symptom_names) 
                 if symptom.lower() in s.lower()]
        if matches:
            input_vector[matches[0]] = 1
    
    prediction = model.predict(input_vector.reshape(1, -1))[0]
    top_idx = np.argmax(prediction)
    return encoder.inverse_transform([top_idx])[0], prediction[top_idx] * 100

# ================== API INTEGRATIONS ================== #
def query_cohere(prompt: str) -> List[str]:
    """Extract symptoms using Cohere API"""
    headers = {"Authorization": f"Bearer {COHERE_API_KEY}"}
    payload = {
        "model": "command",
        "prompt": f"Extract medical symptoms from: '{prompt}'. Return comma-separated list.",
        "temperature": 0.3,
        "max_tokens": 300
    }
    
    try:
        response = requests.post(COHERE_API_URL, json=payload, headers=headers)
        return [s.strip().lower() for s in response.json()["generations"][0]["text"].split(",") if s.strip()]
    except:
        return []

def query_mistral(prompt: str, retries=2) -> str:
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 400}
    }
    
    for attempt in range(retries):
        try:
            response = requests.post(
                HF_API_URL,
                headers=headers,
                json=payload,
                timeout=10  # Add timeout
            )
            
            if response.status_code == 200:
                return response.json()[0]['generated_text'].split("[/INST]")[-1].strip()
            elif response.status_code == 503:
                wait_time = (attempt + 1) * 5  # Exponential backoff
                time.sleep(wait_time)
                continue
            else:
                st.error(f"API Error: {response.text}")
        except requests.exceptions.RequestException as e:
            st.error(f"Connection error: {str(e)}")
            time.sleep(3)
    
    return "I couldn't generate a response. Please try again."

# ================== CHAT INTERFACE ================== #
def display_message(role: str, content: str, is_error=False):
    """Display a message in the chat"""
    with st.chat_message(role):
        if is_error:
            st.error(content)
        else:
            st.markdown(content)

def display_analysis(condition: str, confidence: float, analysis: Dict):
    """Display analysis results in an expandable section"""
    with st.expander("🔍 Analysis Details", expanded=True):
        # Severity summary
        severity_emoji = "🚨" if analysis["is_emergency"] else "⚠️" if analysis["overall_score"] >= 7 else "ℹ️"
        st.subheader(f"{severity_emoji} Overall Severity Score: {analysis['overall_score']:.1f}")
        
        # Condition prediction
        st.subheader(f"📋 Predicted Condition: {condition} ({confidence:.1f}% confidence)")
        
        # Symptom breakdown
        st.subheader("🩺 Symptom Breakdown")
        for detail in analysis["details"]:
            col1, col2, col3 = st.columns([2, 2, 3])
            with col1:
                st.markdown(f"**{detail['symptom'].title()}**")
            with col2:
                st.markdown(f"`Base: {detail['base']}` `Score: {detail['score']:.1f}`")
            with col3:
                st.markdown(f"<span class='severity-{detail['level']}'>{detail['level'].upper()}</span>", 
                           unsafe_allow_html=True)
        
        # Emergency warning
        if analysis["is_emergency"]:
            st.error("""
            ❗ EMERGENCY ALERT: This requires immediate medical attention!  
            **Call emergency services or go to the nearest hospital.**
            """)

def stream_response(text: str):
    """Stream the response character by character"""
    message_placeholder = st.empty()
    full_response = ""
    
    for chunk in text.split(" "):
        full_response += chunk + " "
        time.sleep(0.05)
        message_placeholder.markdown(full_response + "▌")
    
    message_placeholder.markdown(full_response)
    return full_response

# ================== MAIN APP ================== #
# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []
    st.session_state.first_run = True

# Load models
model, encoder, symptom_names = load_models()

# Sidebar with information
with st.sidebar:
    st.title("🩺 About")
    st.markdown("""
    **AI Medical Assistant** helps you:
    - Analyze symptoms with severity scoring
    - Get preliminary condition predictions
    - Receive general health advice
    
    *Note: This is not a substitute for professional medical care.*
    """)
    
    st.divider()
    st.markdown("**How to use:**")
    st.markdown("- Describe symptoms like: 'I have severe headache'")
    st.markdown("- Ask health questions like: 'how to lower blood pressure'")
    
    if st.button("🧹 Clear Chat History"):
        st.session_state.messages = []
        st.rerun()

# Main chat interface
st.title("🤖 AI Medical Assistant")
st.caption("Describe your symptoms or ask health questions")

# Display chat messages from history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Welcome message
if st.session_state.first_run:
    with st.chat_message("assistant"):
        st.markdown("""
        Hello! I'm your AI Medical Assistant.  
        You can:
        - Describe symptoms (e.g., "I have severe headache and fever")
        - Ask health questions (e.g., "how to lower cholesterol")
        
        *What would you like to discuss today?*
        """)
    st.session_state.first_run = False

# User input
if prompt := st.chat_input("Type your message here..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Show thinking indicator
    with st.chat_message("assistant"):
        thinking_placeholder = st.empty()
        thinking_placeholder.markdown("💭 Analyzing your message...")
    
    try:
        # Detect intent
        if any(kw in prompt.lower() for kw in ['how to', 'way to', 'reduce', 'prevent']):
            # Health advice flow
            thinking_placeholder.empty()
            with st.chat_message("assistant"):
                response = query_mistral(f"Provide 2-3 actionable health recommendations for: {prompt}. Focus on evidence-based advice.")
                streamed_response = stream_response(response)
            
            st.session_state.messages.append({"role": "assistant", "content": streamed_response})
        
        else:
            # Symptom analysis flow
            symptoms = query_cohere(prompt)
            
            if not symptoms:
                thinking_placeholder.empty()
                with st.chat_message("assistant"):
                    st.error("I couldn't identify specific symptoms. Please describe them more clearly.")
            
            # Get prediction and analysis
            condition, confidence = predict_condition(symptoms)
            analysis = analyze_symptoms(symptoms, prompt)
            
            # Generate advice
            advice_prompt = f"""
            <s>[INST] As a doctor, provide advice for possible {condition}.
            Symptoms: {', '.join(symptoms)}.
            Severity score: {analysis['overall_score']:.1f}.
            
            Provide:
            1. Immediate actions
            2. Monitoring recommendations
            3. When to seek care
            4. General management tips
            Structure by priority. [/INST]
            """
            advice = query_mistral(advice_prompt)
            
            # Display results
            thinking_placeholder.empty()
            
            # Analysis details
            with st.chat_message("assistant"):
                display_analysis(condition, confidence, analysis)
                st.divider()
                st.subheader("💡 Recommended Actions")
                streamed_response = stream_response(advice)
            
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"**Analysis for:** {', '.join(symptoms)}\n\n" +
                          f"**Condition:** {condition} ({confidence:.1f}% confidence)\n" +
                          f"**Severity:** {analysis['overall_score']:.1f}\n\n" +
                          f"**Advice:**\n{streamed_response}"
            })
    
    except Exception as e:
        thinking_placeholder.empty()
        with st.chat_message("assistant"):
            st.error(f"An error occurred: {str(e)}. Please try again.")