import joblib
import pandas as pd
import numpy as np
import os
from django.conf import settings


class DietRecommendationModel:
    def __init__(self, model_path=None, encoder_path=None, dataset_path=None):



        if model_path is None:
            model_path = os.path.join(settings.BASE_DIR,  'app','ml_models', 'diet_recommendation_model3.joblib')
        if encoder_path is None:
            encoder_path = os.path.join(settings.BASE_DIR, 'app','ml_models', 'label_encoders3.joblib')
        if dataset_path is None:
            dataset_path = os.path.join(settings.BASE_DIR, 'app','ml_models', 'updated_fitness_diet_dataset1.csv')


        self.model = joblib.load(model_path)
        self.encoders = joblib.load(encoder_path)
        self.diet_df = pd.read_csv(dataset_path)
        
        # Apply label encoding to the loaded dataset
        for column in ['Breakfast 1', 'Breakfast 2', 'Lunch 1', 'Lunch 2', 'Dinner 1', 'Dinner 2', 'Food Type']:
            self.diet_df[column] = self.encoders[column.lower().replace(' ', '')].transform(self.diet_df[column])

    def find_closest_match(self, predicted_meals, veg_only):
        if veg_only:
            veg_label = self.encoders['foodtype'].transform(['Veg'])[0]
            veg_df = self.diet_df[self.diet_df['Food Type'] == veg_label]
        else:
            veg_df = self.diet_df

        if veg_df.empty:
            print("No data available after filtering.")
            return None

        diffs = (
            np.abs(veg_df['Breakfast 1'] - predicted_meals[0]) +
            np.abs(veg_df['Breakfast 2'] - predicted_meals[1]) +
            np.abs(veg_df['Lunch 1'] - predicted_meals[2]) +
            np.abs(veg_df['Lunch 2'] - predicted_meals[3]) +
            np.abs(veg_df['Dinner 1'] - predicted_meals[4]) +
            np.abs(veg_df['Dinner 2'] - predicted_meals[5])
        )

        closest_match_idx = diffs.idxmin()
        return veg_df.loc[closest_match_idx]

    def recommend_diet(self, BMI, BMR, Total_Calories, veg_only):
        user_input = pd.DataFrame([[BMI, BMR, Total_Calories]], columns=['BMI', 'BMR', 'Total Calories'])

        rf_breakfast1, rf_breakfast2, rf_lunch1, rf_lunch2, rf_dinner1, rf_dinner2, rf_foodtype = self.model

        foodtype_pred = self.encoders['foodtype'].inverse_transform(rf_foodtype.predict(user_input))[0]
        if veg_only:
            foodtype_pred = 'Veg'

        breakfast1_pred = rf_breakfast1.predict(user_input)[0]
        breakfast2_pred = rf_breakfast2.predict(user_input)[0]
        lunch1_pred = rf_lunch1.predict(user_input)[0]
        lunch2_pred = rf_lunch2.predict(user_input)[0]
        dinner1_pred = rf_dinner1.predict(user_input)[0]
        dinner2_pred = rf_dinner2.predict(user_input)[0]

        predicted_meals = [breakfast1_pred, breakfast2_pred, lunch1_pred, lunch2_pred, dinner1_pred, dinner2_pred]

        closest_match = self.find_closest_match(predicted_meals, veg_only)

        if closest_match is None:
            return {"Error": "No matching meals found."}

        total_calories = closest_match['Total Calories']

        return {
            "Breakfast 1": self.encoders['breakfast1'].inverse_transform([int(closest_match['Breakfast 1'])])[0],
            "Breakfast 2": self.encoders['breakfast2'].inverse_transform([int(closest_match['Breakfast 2'])])[0],
            "Lunch 1": self.encoders['lunch1'].inverse_transform([int(closest_match['Lunch 1'])])[0],
            "Lunch 2": self.encoders['lunch2'].inverse_transform([int(closest_match['Lunch 2'])])[0],
            "Dinner 1": self.encoders['dinner1'].inverse_transform([int(closest_match['Dinner 1'])])[0],
            "Dinner 2": self.encoders['dinner2'].inverse_transform([int(closest_match['Dinner 2'])])[0],
            "Food Type": foodtype_pred,
            "Total Calories": total_calories
        }

# Usage example
if __name__ == "__main__":
    model = DietRecommendationModel()
    recommendation = model.recommend_diet(BMI=25, BMR=1500, Total_Calories=2000, veg_only=False)
    print(recommendation)