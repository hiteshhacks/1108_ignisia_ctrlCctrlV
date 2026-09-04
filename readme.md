<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-FF6600?style=for-the-badge&logo=groq&logoColor=white" />
  <img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/Qdrant-DC382D?style=for-the-badge&logo=qdrant&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

<h1 align="center">🏥 Jeevan — AI-Powered ICU & Medical Intelligence Platform</h1>

<p align="center">
  <strong>An end-to-end agentic AI system for medical report extraction, clinical reasoning, sepsis risk detection, PII privacy sanitization, and family-friendly health communication — powered by LangGraph multi-agent orchestration, RAG, and vision AI.</strong>
</p>


---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Project Directory Structure](#-project-directory-structure)
- [Architecture Diagram](#-architecture-diagram)
- [Workflow Diagram](#-workflow-diagram)
- [Tech Stack](#-tech-stack)
- [AI Pipeline Deep Dive](#-ai-pipeline-deep-dive)
- [API Reference](#-api-reference)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [RAG Knowledge Base](#-rag-knowledge-base)
- [Database Schema](#-database-schema)
- [Usage Walkthrough](#-usage-walkthrough)
- [Disclaimer](#-disclaimer)

---

## 🔭 Overview

**Jeevan** is a full-stack, AI-driven medical intelligence platform designed for ICU monitoring and early sepsis detection. It transforms raw medical report images into structured, actionable clinical insights through a sophisticated multi-step AI pipeline:

1. **Vision AI** extracts structured data from medical report images   
2. **Multi-agent reasoning** (LangGraph StateGraph orchestration) analyzes trends, abnormalities, and clinical risks  
3. **RAG-augmented validation** enriches findings with clinical guideline citations from Qdrant vector database  
4. **Chief Agent** provides senior-doctor-level risk assessment with temporal trend mapping and $3\sigma$ statistical anomaly detection  
5. **Family Communication Layer** translates clinical reports into simple, compassionate language in both English and Hindi  

The platform bridges the critical gap between complex medical data and human understanding, serving both clinicians (with data-driven dashboards) and patient families (with jargon-free summaries).

---

## ✨ Key Features

### 🔬 Intelligent Medical Data Extraction
- Upload medical report images (JPG, PNG, WEBP)
- AI-powered extraction using **qwen/qwen3.8-27b** multimodal vision model via Groq
- Automatic extraction of patient info, test names, values, units, reference ranges, dates, lab/doctor details
- Image compression & optimization pipeline for consistent OCR/VQA results
- Persistent storage in SQLite with automatic patient deduplication

### 🛡️ Built-in PII Anonymization & Privacy Guard
- Zero-overhead native regex sanitization middleware
- Anonymizes sensitive personal identifiable information (emails, phone numbers, social security / Aadhaar numbers, explicit identifiers) before sending payloads to external LLMs
- Ensures HIPAA-conscious privacy and safe agentic reasoning

### 🧠 Multi-Agent Clinical Reasoning (LangGraph)
- **Medical Data Analyst Agent** — identifies clinical abnormalities, historical trends, and cross-test correlations
- **Health Advisor Agent** — generates safe, evidence-based, non-diagnostic monitoring recommendations
- **Medical Reasoning Team Lead** — synthesizes agent findings into structured clinical assessments
- Built on **LangGraph** `StateGraph` multi-agent orchestration with **Groq** (`openai/gpt-oss-120b`)

### 🩺 Chief Agent — Senior ICU Doctor Simulation
- Temporal mapping of all test results across chronological data points
- Statistical outlier detection ($3\sigma$ standard deviation method) for anomaly flagging
- Disease progression tracking and sepsis/organ failure risk scoring
- Contextual reasoning enriched with medical guideline citations via RAG

### 📚 RAG (Retrieval-Augmented Generation)
- Pre-indexed medical guideline PDFs: sepsis protocols, early warning scores (EWS), organ dysfunction (SOFA) guidelines, and ICU warnings
- Vector search via **Qdrant** with `sentence-transformers/all-MiniLM-L6-v2` embeddings
- Auto-generated search queries from clinical findings for targeted context retrieval
- Final reports cite specific guideline sources for verifiable clinical validation

### 👨‍👩‍👧 Family-Friendly Communication
- Rewrites dense clinical reports into simple, compassionate layman language
- Structured sections: *What reports show*, *Things to watch*, *Good signs*, *Next steps*, and *Message for the family*
- Warm analogies and everyday comparisons (eliminates medical jargon and confusing metrics)
- **Multi-language support**: automated translation into Hindi (extensible to additional regional languages)

### 📊 Analytics & Visualization
- Patient chart data API optimized for frontend charting (Chart.js/Recharts)
- Test values grouped by test name with temporal data points
- Numeric value parsing with fallback for non-standard formats
- Combined report generation (timeline + charts + AI analysis)

---

## 🏗 Architecture Diagram

<p align="center">
  <img src="docs/architechturaldiagram.jpeg" alt="Jeevan System Architecture Diagram" width="100%" />
</p>

---

## 🔄 Workflow Diagram

<p align="center">
  <img src="docs/workflow.jpeg" alt="Jeevan Application Workflow Diagram" width="100%" />
</p>

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | FastAPI + Uvicorn | High-performance async REST API |
| **Vision AI** | qwen/qwen3.8-27b | Medical report image parsing and OCR |
| **Multi-Agent Reasoning** | LangGraph + LangChain Groq | Multi-agent state graph clinical reasoning |
| **Chief Agent LLM** | Groq + GPT-OSS-20B / 120B | Senior doctor-level clinical synthesis |
| **RAG Vector DB** | Qdrant (Cloud) | Medical guideline storage and semantic retrieval |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` | Dense vector embeddings for clinical guidelines |
| **Document Ingestion** | LangChain + PyPDF | PDF guideline loading, splitting, and indexing |
| **Database** | SQLite | Patient records & historical test persistence |
| **Image Processing** | Pillow (PIL) | Image optimization, resizing, and base64 encoding |
| **Frontend** | HTML5 + TailwindCSS + Chart.js | Responsive clinical dashboard & family portal |
| **Translation** | Groq LLM | Multi-language family communication (English & Hindi) |

---

## 🧪 AI Pipeline Deep Dive

### Pipeline 1: Medical Report Extraction (`/extract`)

```
Medical Report Image
        │
        ▼
┌─────────────────┐
│ File Validation  │ ← JPG / PNG / WEBP validation
├─────────────────┤
│ Image Compress   │ ← Resize to 1024x1024, JPEG quality 80
├─────────────────┤
│ Base64 Encoding  │
├─────────────────┤
│ Groq Vision API  │ ← LLaMA 4 Scout 17B multimodal
│ (Structured JSON │   Extracts: patient, tests[], timeline,
│  extraction)     │   lab_name, doctor_name
├─────────────────┤
│ JSON Parsing     │ ← Robust extraction & normalization
├─────────────────┤
│ SQLite Storage   │ ← Auto-deduplicates patients by name
└─────────────────┘
```

### Pipeline 2: Full Clinical Reasoning & Family Summary (`/reason-medical`)

```
Patient Name (input)
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│ Step 1: Fetch historical tests from SQLite database      │
├──────────────────────────────────────────────────────────┤
│ Step 2: Privacy Sanitizer (PII Redaction)                │
│   └─ Strips phone, email, SSN/Aadhaar, direct IDs        │
├──────────────────────────────────────────────────────────┤
│ Step 3: Multi-Agent Reasoning (LangGraph StateGraph)     │
│   ├─ Medical Data Analyst → abnormalities, trends,       │
│   │                          correlations, data quality  │
│   ├─ Health Advisor → recommendations, risk indicators,  │
│   │                    monitoring suggestions             │
│   └─ Team Synthesizer → consolidated clinical assessment │
├──────────────────────────────────────────────────────────┤
│ Step 4: RAG Augmentation                                 │
│   ├─ Generate targeted search queries from findings      │
│   ├─ Vector similarity search in Qdrant (medical PDFs)   │
│   └─ LLM synthesizes final report with guideline cites   │
├──────────────────────────────────────────────────────────┤
│ Step 5: Family Communication                             │
│   ├─ Rewrite clinical report into layman language        │
│   └─ Translate summary to Hindi                          │
└──────────────────────────────────────────────────────────┘
        │
        ▼
{
  "reasoning": "Full clinical report (markdown)",
  "family_communication": {
    "english": "Simple family-friendly summary",
    "hindi": "हिंदी में सरल सारांश"
  }
}
```

### Pipeline 3: Chief Agent Report (`/report_explanation`)

```
Patient Name → DB Lookup → Temporal Mapping → Outlier Detection (3σ)
        │
        ▼
RAG Context Retrieval (medical guidelines from Qdrant)
        │
        ▼
Chief Agent LLM Prompt (Senior ICU Doctor role):
  ├─ Disease progression identification
  ├─ Sepsis / organ failure risk assessment
  ├─ Outlier analysis (identifies anomalous lab artifacts)
  ├─ Evidence-based reasoning with guideline citations
  └─ Safety disclaimer
```

---

## 📡 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/extract` | Upload medical report image → AI extraction → store in DB |
| `POST` | `/reason-medical` | Full LangGraph clinical reasoning pipeline with family communication |
| `GET` | `/patient/{patient_name}/chart-data` | Chart-optimized medical test trends and reference ranges |
| `GET` | `/report_explanation?patient_name=X` | Chief Agent clinical evaluation & sepsis risk analysis |
| `GET` | `/generate-report?patient_name=X` | Combined timeline + charts + AI report overview |
| `GET` | `/health` | Service health check |

### `POST /extract`

**Request:** `multipart/form-data` with `file` field (image)

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": { "name": "JOHN DOE", "age": "45", "gender": "Male" },
    "tests": [
      { "name": "Hemoglobin", "value": "12.5", "unit": "g/dL", "reference_range": "13-17", "date": "2026-03-15" }
    ],
    "timeline": ["2026-03-15"],
    "lab_name": "City Diagnostics",
    "doctor_name": "Dr. Smith"
  },
  "message": "Extraction successful and data saved to database!"
}
```

### `POST /reason-medical`

**Request Body:**
```json
{
  "patient_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "reasoning": "# Final Patient Report\n## Clinical Summary\n...(markdown with guideline citations)...",
  "family_communication": {
    "english": "🏥 What the reports show\nYour loved one's blood tests...",
    "hindi": "🏥 रिपोर्ट क्या दिखाती है\nआपके प्रियजन के रक्त परीक्षण..."
  },
  "message": "Reasoning + family communication generated successfully."
}
```

### `GET /patient/{patient_name}/chart-data`

**Response:**
```json
{
  "success": true,
  "patient": "JOHN DOE",
  "chart_data": {
    "Hemoglobin": {
      "unit": "g/dL",
      "reference_range": "13-17",
      "data": [
        { "date": "2026-03-15", "value": 12.5, "raw_value_string": "12.5", "test_name": "Hemoglobin" }
      ]
    }
  },
  "raw_tests": [...]
}
```

---

## ⚙ Setup & Installation

### Prerequisites

- **Python 3.10+**
- **Groq API Key** (for LLM inference — [console.groq.com](https://console.groq.com))
- **Qdrant instance** (Cloud or Local — [qdrant.tech](https://qdrant.tech))
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ignisia.git
cd ignisia
```

### 2. Create & Activate Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root (or inside `backend/`):

```env
GROQ_API_KEY=your_groq_api_key_here
QDRANT_URL=https://your-qdrant-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY_CLOUD=your_qdrant_api_key_here
```

### 5. Index Medical Guidelines (First-Time Only)

```bash
cd backend
python -m tools.RAG.indexing
```

This chunks and indexes the medical PDF documents into your Qdrant vector collection.

### 6. Start the Backend Server

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

### 7. Open the Frontend

Open any of the HTML pages in `frontend_stiched/` in your browser:

```bash
# Windows
start frontend_stiched\login.html

# macOS
open frontend_stiched/login.html
```

> **Note:** Ensure the backend is running at `http://localhost:8000` so that AJAX requests function seamlessly.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | API key for Groq LLM inference (vision, LangGraph reasoning, translations) |
| `QDRANT_URL` | ✅ | URL of your Qdrant vector database instance |
| `QDRANT_API_KEY_CLOUD` | ✅ | API key for Qdrant cloud authentication |

---

## 📚 RAG Knowledge Base

The RAG system is pre-loaded with authoritative medical guideline PDFs in `backend/tools/RAG/DATA/`:

| Document | Content |
|----------|---------|
| `Sepsis_protocol.pdf` | Comprehensive sepsis management protocols |
| `associated_organ_dysfunction.pdf` | Organ dysfunction assessment criteria (e.g., SOFA score) |
| `ews.pdf` | Early Warning Score (EWS) calculation guidelines |
| `icu_warnings.pdf` | ICU-specific warning signs and intervention triggers |
| `sepsis_rag_dataset.pdf` | Supplementary sepsis detection data |
| `sepsis_warnig.pdf` | Sepsis warning indicators and clinical pathways |

**To add custom guidelines:** Place PDF files in `backend/tools/RAG/DATA/` and re-run `python -m tools.RAG.indexing`.

---

## 🗄 Database Schema

The application uses SQLite with two core tables:

### `patients`
| Column | Type | Constraint |
|--------|------|------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | UNIQUE |
| `age` | TEXT | — |
| `gender` | TEXT | — |

### `medical_tests`
| Column | Type | Constraint |
|--------|------|------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `patient_id` | INTEGER | FOREIGN KEY → patients(id) |
| `test_name` | TEXT | — |
| `test_value` | TEXT | — |
| `unit` | TEXT | — |
| `reference_range` | TEXT | — |
| `test_date` | TEXT | — |
| `lab_name` | TEXT | — |
| `doctor_name` | TEXT | — |

> Patient deduplication is handled automatically by matching uppercase patient name. Uploading subsequent reports for the same patient appends new test data to their existing history.

---

## 🚀 Usage Walkthrough

### Step 1: Upload a Medical Report
Navigate to **Upload Screen** (`screen1.html`) and upload a medical report image. The AI extracts structured lab test metrics and saves them to the database.

### Step 2: View Analytics Dashboard
Go to the **Dashboard** (`screen2.html`) to inspect interactive charts of test values over time, grouped by test name with reference ranges displayed.

### Step 3: Generate AI Clinical Report
On the **Report Screen** (`screen3.html`), enter the patient name and trigger the full reasoning pipeline to get an evidence-backed clinical assessment with guideline citations.

### Step 4: Share with Family
Visit the **Family Dashboard** (`family_dashboard.html`) to view the simplified, compassionate summary with Hindi translation.

---

## ⚠ Disclaimer

> **This software is for informational and decision-support purposes only.** It is NOT a substitute for professional medical diagnosis, treatment, or advice. All outputs include AI-generated analysis that may contain errors. Always consult a qualified healthcare professional for clinical decisions.

---

<p align="center">
  <strong>Built with ❤️ for better healthcare communication</strong><br/>
  <em>Jeevan — Bridging the gap between clinical data and human understanding</em>
</p>
