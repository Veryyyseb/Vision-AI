import os
import threading
import time
import datetime
import base64
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
INTERVAL_SECONDS = int(os.getenv("ANALYSIS_INTERVAL", 30))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Shared camera frame (set this from main pipeline) ---
latest_frame = None
frame_lock = threading.Lock()

def set_frame(frame):
    global latest_frame
    with frame_lock:
        latest_frame = frame

def get_frame():
    with frame_lock:
        return latest_frame

# --- Gemini Path ---
def analyze_with_gemini(frame):
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        image_b64 = base64.b64encode(buffer).decode('utf-8')

        payload = {
            "contents": [{
                "parts": [
                    {"text": "Describe what is happening in this scene in one or two sentences. Then classify the situation as one of: normal, concerning, or unsafe. Format your response as: SUMMARY: <summary> STATUS: <status>"},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}}
                ]
            }]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        response = requests.post(url, json=payload)
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

        summary = ""
        status = "normal"
        for line in text.splitlines():
            if line.startswith("SUMMARY:"):
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("STATUS:"):
                status = line.replace("STATUS:", "").strip().lower()

        return {
            "summary": summary,
            "status": status,
            "timestamp": datetime.datetime.now().isoformat(),
            "source": "gemini"
        }
    except Exception as e:
        return {"summary": f"Error: {e}", "status": "error", "timestamp": datetime.datetime.now().isoformat(), "source": "gemini"}

# --- Local Model Path (moondream2 via ollama) ---
def analyze_with_local(frame):
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        image_b64 = base64.b64encode(buffer).decode('utf-8')

        payload = {
            "model": "moondream",
            "prompt": "Describe what is happening in this scene in one or two sentences. Then classify the situation as one of: normal, concerning, or unsafe. Format your response as: SUMMARY: <summary> STATUS: <status>",
            "images": [image_b64]
        }

        response = requests.post("http://localhost:11434/api/generate", json=payload, stream=False)
        text = response.json().get("response", "")

        summary = ""
        status = "normal"
        for line in text.splitlines():
            if line.startswith("SUMMARY:"):
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("STATUS:"):
                status = line.replace("STATUS:", "").strip().lower()

        return {
            "summary": summary,
            "status": status,
            "timestamp": datetime.datetime.now().isoformat(),
            "source": "local"
        }
    except Exception as e:
        return {"summary": f"Error: {e}", "status": "error", "timestamp": datetime.datetime.now().isoformat(), "source": "local"}

# --- Log result ---
def log_result(result):
    with open("event_log.jsonl", "a") as f:
        f.write(json.dumps(result) + "\n")
    print(f"[{result['source']}] {result['timestamp']} | {result['status']} | {result['summary']}")

# --- Alert if unsafe ---
def check_alert(result):
    if result.get("status") == "unsafe":
        try:
            from alert_engine import AlertEngine
            AlertEngine.trigger(result)
        except Exception as e:
            print(f"Alert failed: {e}")

# --- Interval loop ---
def run_interval_analysis():
    import cv2
    while True:
        time.sleep(INTERVAL_SECONDS)
        frame = get_frame()
        if frame is None:
            continue

        t1 = threading.Thread(target=lambda: [log_result(r := analyze_with_gemini(frame)), check_alert(r)])
        t2 = threading.Thread(target=lambda: [log_result(r := analyze_with_local(frame)), check_alert(r)])
        t1.start()
        t2.start()

# --- Start ---
def start(frame_source=None):
    import cv2
    if frame_source:
        set_frame(frame_source)
    thread = threading.Thread(target=run_interval_analysis, daemon=True)
    thread.start()
    print(f"Interval analysis started. Running every {INTERVAL_SECONDS} seconds.")