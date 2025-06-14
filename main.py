from models.predict_skin_cancer import predict_skin_cancer, image_discriminator

def main():

    filepath = r"C:\Users\dimit\OneDrive\Desktop\Screenshot 2024-01-15 113845.png"

    print(image_discriminator(filepath))

    print(predict_skin_cancer(filepath))




if __name__ == "__main__":
    main()
