import cv2
import mediapipe as mp
import numpy as np
import os
import time
from datetime import datetime

print("PROGRAM STARTED")

# ===================== CONFIG =====================
SUBJECT_ID = "S001"
SAVE_DIR = "dataset"
CAMERA_INDEX = 0   # change to 1 or 2 if needed
STABLE_TIME = 1.5
# ==================================================

ANGLE_RANGES = {
    "center": (-5, 5),
    "right": (15, 25),
    "left": (-25, -15)
}

os.makedirs(SAVE_DIR, exist_ok=True)

print("INITIALIZING MEDIAPIPE...")
mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True
)

print("OPENING CAMERA...")
cap = cv2.VideoCapture(CAMERA_INDEX)

print("CAMERA OPEN STATUS:", cap.isOpened())

if not cap.isOpened():
    print("ERROR: CAMERA NOT ACCESSIBLE")
    exit()

print("CAMERA OPENED SUCCESSFULLY")

targets = ["center", "right", "left"]
current_target = 0
stable_start = None

def estimate_yaw(landmarks, width):
    left_eye = landmarks[33].x * width
    right_eye = landmarks[263].x * width
    nose = landmarks[1].x * width
    return nose - (left_eye + right_eye) / 2
print("ENTERING MAIN LOOP")

while current_target < len(targets):
    ret, frame = cap.read()
    if not ret:
        print("FAILED TO READ FRAME")
        break

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    target = targets[current_target]
    min_yaw, max_yaw = ANGLE_RANGES[target]

    if results.multi_face_landmarks:
        face = results.multi_face_landmarks[0]
        yaw_raw = estimate_yaw(face.landmark, w)
        yaw = np.interp(yaw_raw, [-w * 0.1, w * 0.1], [-30, 30])

        cv2.putText(frame, f"Target: {target.upper()}",
                    (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0), 2)
        cv2.putText(frame, f"Yaw: {yaw:.2f}",
                    (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9,
                    (255, 255, 0), 2)

        if min_yaw <= yaw <= max_yaw:
            if stable_start is None:
                stable_start = time.time()

            elapsed = time.time() - stable_start
            cv2.putText(frame, f"HOLD {elapsed:.1f}s",
                        (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.9,
                        (0, 255, 255), 2)

            if elapsed >= STABLE_TIME:
                filename = f"{SUBJECT_ID}_{target}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                cv2.imwrite(os.path.join(SAVE_DIR, filename), frame)
                print("Captured:", filename)

                current_target += 1
                stable_start = None
                time.sleep(1)
        else:
            stable_start = None

    cv2.imshow("DEBUG CAMERA FEED", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        print("ESC PRESSED — EXITING")
        break

cap.release()
cv2.destroyAllWindows()
print("PROGRAM ENDED")
