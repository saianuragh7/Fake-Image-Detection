import cv2
import os

print("PROGRAM STARTED")

SAVE_DIR = "dataset"
os.makedirs(SAVE_DIR, exist_ok=True)

cap = cv2.VideoCapture(0)
print("Camera open status:", cap.isOpened())

if not cap.isOpened():
    print("ERROR: Camera not accessible")
    exit()

print("Camera opened")
print("Press 'S' to save photo")
print("Press 'ESC' to exit")

count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to read frame")
        break

    cv2.imshow("CAMERA FEED", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('s'):
        filename = os.path.join(SAVE_DIR, f"photo_{count}.jpg")
        cv2.imwrite(filename, frame)
        print("PHOTO SAVED:", filename)
        count += 1

    elif key == 27:  # ESC
        print("EXITING")
        break

cap.release()
cv2.destroyAllWindows()
print("PROGRAM ENDED")
