from models.predict_skin_cancer import predict_skin_cancer, image_discriminator

def main():

    filepath = r"C:\Users\dimit\OneDrive\Desktop\02.png"

    print(image_discriminator(filepath))

    print(predict_skin_cancer(filepath))




if __name__ == "__main__":
    main()
