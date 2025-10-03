from ultralytics import YOLO
import time

def main():
    # Load a pretrained YOLO11n model
    model = YOLO("best.onnx")

    # Perform object detection on an image
    timer = time.time()
    results = model.predict("levle0_161_png_jpg.rf.52cb83292dd47b1a7721eb0533c03a52.jpg", device='cpu')  # Predict on an image
    results[0].show()  # Display results
    print(f"Elapsed time: {time.time() - timer}")



if __name__ == '__main__':
    main()