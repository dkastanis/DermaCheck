from models.skin_lesion_classifier import predict_skin_cancer, image_discriminator

def main():

    # example filepath
    filepath = r"F:\AI PROJECTS\DermaCheck\classes\4_melanocytic_nevi\ISIC_0024444.jpg"

    print(image_discriminator(filepath))

    print(predict_skin_cancer(filepath))




if __name__ == "__main__":
    main()
