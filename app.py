import streamlit as st
import pandas as pd
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pytesseract
from PIL import Image

# Windows Tesseract Path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# --- HELPER FUNCTIONS ---

def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + " "
    return text

def extract_text_from_image(image_file):
    image = Image.open(image_file)
    return pytesseract.image_to_string(image)


# --- STREAMLIT UI ---

st.set_page_config(page_title="AI Resume Screening & Camera Scanner", layout="wide")
st.title("📄 AI Resume Screening & Camera Scanner")

# Sidebar
st.sidebar.header("Job Description (JD)")
jd_text = st.sidebar.text_area("Paste Job Description here:", height=250)

st.sidebar.header("Resume Input Method")
input_mode = st.sidebar.radio("Select Mode:", ["Upload PDF", "Scan via Camera"])

resumes_data = []

if input_mode == "Upload PDF":
    uploaded_files = st.file_uploader("Upload Resumes (PDF)", type=["pdf"], accept_multiple_files=True)
    if uploaded_files:
        for file in uploaded_files:
            text = extract_text_from_pdf(file)
            resumes_data.append({"filename": file.name, "text": text})

elif input_mode == "Scan via Camera":
    camera_photo = st.camera_input("Take a clear picture of physical resume")
    if camera_photo:
        with st.spinner("Extracting text from photo..."):
            scanned_text = extract_text_from_image(camera_photo)
        
        if scanned_text.strip():
            st.success("Resume scanned successfully!")
            resumes_data.append({"filename": "Scanned_Resume.png", "text": scanned_text})
        else:
            st.warning("Could not extract text. Please ensure good lighting and clear camera focus.")


# --- RESUME SCREENING LOGIC ---

if st.button("Process Resumes"):
    if not jd_text.strip():
        st.error("Please enter a Job Description in the sidebar!")
    elif not resumes_data:
        st.error("Please upload a PDF or scan a resume via camera first!")
    else:
        results = []
        for item in resumes_data:
            resume_text = item["text"]
            
            # TF-IDF & Cosine Similarity Score
            docs = [jd_text, resume_text]
            tfidf = TfidfVectorizer().fit_transform(docs)
            score = round(cosine_similarity(tfidf)[0][1] * 100, 2)
            
            # Missing Keywords
            jd_words = set(jd_text.lower().split())
            res_words = set(resume_text.lower().split())
            missing = list(jd_words - res_words)
            missing_filtered = [w for w in missing if len(w) > 3][:5]
            missing_str = ", ".join(missing_filtered) if missing_filtered else "None"
            
            results.append({
                "Filename": item["filename"],
                "Match Score (%)": score,
                "Missing Keywords": missing_str
            })
        
        df = pd.DataFrame(results).sort_values(by="Match Score (%)", ascending=False)
        
        st.success(f"Processed {len(results)} Resume(s) successfully!")
        
        # Download Report CSV
        csv_data = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📌 Download Screening Report (CSV)",
            data=csv_data,
            file_name="resume_screening_report.csv",
            mime="text/csv"
        )
        
        st.markdown("---")
        st.dataframe(df, use_container_width=True)
