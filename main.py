from model.predict_skin_cancer import predict_skin_cancer

def main():

    filepath = r"C:\Users\dimit\OneDrive\Desktop\classes\3_vascular_lesions\ISIC_0024370.jpg"

    predict_skin_cancer(filepath)


if __name__ == "__main__":
    main()
