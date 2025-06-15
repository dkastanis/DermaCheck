from models.predict_skin_cancer import predict_skin_cancer, image_discriminator

def main():

    filepath = r"F:\AI PROJECTS\DermaCheck\classes\4_melanocytic_nevi\ISIC_0024444.jpg"

    print(image_discriminator(filepath))

    print(predict_skin_cancer(filepath))




if __name__ == "__main__":
    main()
