import cv2
import os
import time

print("PROGRAM STARTED")

SAVE_DIR = "dataset"
os.makedirs(SAVE_DIR, exist_ok=True)

cap = cv2.VideoCapture(0)
print("Camera open status:", cap.isOpened())

if not cap.isOpened():
    print("ERROR: Camera not accessible")
    exit()

print("Camera opened. Photo will be taken in 3 seconds...")

start_time = time.time()
photo_taken = False

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to read frame")
        break

    cv2.imshow("CAMERA - WAIT 3 SECONDS", frame)

    if not photo_taken and time.time() - start_time >= 3:
        filename = os.path.join(SAVE_DIR, "test_photo.jpg")
        cv2.imwrite(filename, frame)
        print("PHOTO SAVED:", filename)
        photo_taken = True

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
print("PROGRAM ENDED")
