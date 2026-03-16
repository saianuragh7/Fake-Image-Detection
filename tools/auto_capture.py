import cv2
import os
import time

# ================= CONFIG =================
SAVE_DIR = "dataset"
CAPTURE_DELAY = 3
CAMERA_INDEX = 0
# =========================================

os.makedirs(SAVE_DIR, exist_ok=True)

instructions = [
    "LOOK STRAIGHT (CENTER)",
    "TURN HEAD RIGHT",
    "TURN HEAD LEFT"
]

cap = cv2.VideoCapture(CAMERA_INDEX)

if not cap.isOpened():
    print("ERROR: Camera not accessible")
    exit()

person_id = 1

while True:  # multiple persons
    photo_count = 0
    start_time = time.time()
    show_instruction = True
    confirmation_time = 0

    print(f"\n--- Capturing Person {person_id} ---")

    while photo_count < len(instructions):
        ret, frame = cap.read()
        if not ret:
            break

        elapsed = int(time.time() - start_time)
        remaining = CAPTURE_DELAY - elapsed

        # SHOW instruction ONLY during countdown
        if show_instruction and remaining > 0:
            cv2.putText(
                frame,
                f"Instruction: {instructions[photo_count]}",
                (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Capturing in: {remaining}",
                (30, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2
            )

        # TIME TO CAPTURE (NO TEXT ON FRAME)
        if remaining <= 0 and show_instruction:
            filename = os.path.join(
                SAVE_DIR,
                f"person{person_id}_photo{photo_count + 1}.jpg"
            )
            cv2.imwrite(filename, frame)
            print(f"Saved: {filename}")

            show_instruction = False
            confirmation_time = time.time()

        # AFTER CAPTURE → SHOW ONLY CONFIRMATION
        if not show_instruction:
            cv2.putText(
                frame,
                "Photo captured successfully",
                (30, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

            # show confirmation for 1 second
            if time.time() - confirmation_time >= 1:
                photo_count += 1
                start_time = time.time()
                show_instruction = True

        cv2.imshow("AUTO PHOTO CAPTURE", frame)

        if cv2.waitKey(1) & 0xFF == 27:
            cap.release()
            cv2.destroyAllWindows()
            exit()

    # After one person
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        cv2.putText(
            frame,
            "Person completed",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            "Press N for Next Person",
            (30, 110),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            "Press ESC to Exit",
            (30, 160),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

        cv2.imshow("AUTO PHOTO CAPTURE", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('n'):
            person_id += 1
            break
        elif key == 27:
            cap.release()
            cv2.destroyAllWindows()
            exit()

cap.release()
cv2.destroyAllWindows()
