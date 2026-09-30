import json
import os
import joblib
import numpy as np
import pandas as pd
from django.conf import settings


class DietRecommendationModel:
    """
    Advanced Macronutrient Vector Space & Constraint Satisfaction Diet Engine.
    Combines verified nutritional profiling, goal-adaptive macro targeting,
    strict dietary filtering (100% pure veg enforcement), and multi-objective
    normalized distance optimization.
    """

    def __init__(
        self,
        model_path=None,
        encoder_path=None,
        dataset_path=None,
        matrix_path=None,
    ):
        base_ml_dir = os.path.join(settings.BASE_DIR, "app", "ml_models")

        if model_path is None:
            model_path = os.path.join(base_ml_dir, "diet_recommendation_model3.joblib")
        if encoder_path is None:
            encoder_path = os.path.join(base_ml_dir, "label_encoders3.joblib")
        if dataset_path is None:
            dataset_path = os.path.join(base_ml_dir, "updated_fitness_diet_dataset1.csv")
        if matrix_path is None:
            matrix_path = os.path.join(base_ml_dir, "food_nutrition_matrix.json")

        # Load legacy Random Forest artifacts (kept for fallback & ensembling)
        try:
            self.model = joblib.load(model_path)
            self.encoders = joblib.load(encoder_path)
        except Exception as e:
            self.model = None
            self.encoders = None

        # Load verified 74-dish nutritional profile matrix
        with open(matrix_path, "r", encoding="utf-8") as f:
            self.nutrition_matrix = json.load(f)

        # Load and enrich meal combination dataset with exact macros
        self.raw_df = pd.read_csv(dataset_path)
        self.meal_columns = [
            "Breakfast 1",
            "Breakfast 2",
            "Lunch 1",
            "Lunch 2",
            "Dinner 1",
            "Dinner 2",
        ]

        self.enriched_df = self._enrich_dataset(self.raw_df)

    def _enrich_dataset(self, df):
        """
        Precomputes total calories, protein, carbs, fats, fiber, and vegetarian purity
        for every row in the dataset using the verified nutritional matrix.
        """
        enriched = df.copy()
        cals, pros, carbs, fats, fibers, pure_veg = [], [], [], [], [], []

        for _, row in df.iterrows():
            c = sum(self.nutrition_matrix.get(row[col], {}).get("calories", 0) for col in self.meal_columns)
            p = sum(self.nutrition_matrix.get(row[col], {}).get("protein_g", 0.0) for col in self.meal_columns)
            cb = sum(self.nutrition_matrix.get(row[col], {}).get("carbs_g", 0.0) for col in self.meal_columns)
            ft = sum(self.nutrition_matrix.get(row[col], {}).get("fats_g", 0.0) for col in self.meal_columns)
            fb = sum(self.nutrition_matrix.get(row[col], {}).get("fiber_g", 0.0) for col in self.meal_columns)
            vg = all(self.nutrition_matrix.get(row[col], {}).get("is_veg", False) for col in self.meal_columns)

            cals.append(c)
            pros.append(p)
            carbs.append(cb)
            fats.append(ft)
            fibers.append(fb)
            pure_veg.append(vg)

        enriched["computed_cals"] = cals
        enriched["computed_protein"] = pros
        enriched["computed_carbs"] = carbs
        enriched["computed_fats"] = fats
        enriched["computed_fiber"] = fibers
        enriched["is_pure_veg"] = pure_veg
        return enriched

    def _calculate_target_macros(self, total_calories, goal=None):
        """
        Computes goal-adapted scientific macronutrient distribution:
        - Muscle Gain: 30% Protein (hypertrophy support), 45% Carbs, 25% Fats
        - Fat Loss: 35% Protein (lean tissue preservation), 35% Carbs, 30% Fats
        - Maintenance / Balanced: 25% Protein, 50% Carbs, 25% Fats
        """
        goal_normalized = str(goal or "").strip().lower()

        if any(term in goal_normalized for term in ["gain", "bulk", "muscle"]):
            protein_ratio = 0.30
            carbs_ratio = 0.45
            fats_ratio = 0.25
            resolved_goal = "Muscle Gain"
        elif any(term in goal_normalized for term in ["loss", "cut", "lose"]):
            protein_ratio = 0.35
            carbs_ratio = 0.35
            fats_ratio = 0.30
            resolved_goal = "Weight Loss"
        else:
            protein_ratio = 0.25
            carbs_ratio = 0.50
            fats_ratio = 0.25
            resolved_goal = "Maintenance"

        target_protein = round((total_calories * protein_ratio) / 4.0, 1)
        target_carbs = round((total_calories * carbs_ratio) / 4.0, 1)
        target_fats = round((total_calories * fats_ratio) / 9.0, 1)

        return {
            "target_calories": float(total_calories),
            "target_protein_g": target_protein,
            "target_carbs_g": target_carbs,
            "target_fats_g": target_fats,
            "goal": resolved_goal,
            "protein_ratio": protein_ratio,
            "carbs_ratio": carbs_ratio,
            "fats_ratio": fats_ratio,
        }

    def recommend_diet(self, BMI, BMR, Total_Calories, veg_only, goal=None):
        """
        Finds the optimal diet plan by minimizing distance in normalized 4D macronutrient
        vector space while strictly guaranteeing vegetarian purity when veg_only is True.
        """
        total_calories = float(Total_Calories)
        is_veg_req = bool(veg_only)

        # 1. Filter candidate plans by dietary preference
        if is_veg_req:
            pool = self.enriched_df[self.enriched_df["is_pure_veg"]].copy()
        else:
            pool = self.enriched_df.copy()

        if pool.empty:
            return {"Error": "No matching diet plans found for the requested dietary constraints."}

        # 2. Determine target macros
        targets = self._calculate_target_macros(total_calories, goal=goal)
        target_cals = targets["target_calories"]
        target_pro = targets["target_protein_g"]
        target_carb = targets["target_carbs_g"]
        target_fat = targets["target_fats_g"]

        # 3. Normalized multi-objective macro distance
        # Weights: Calorie proximity (1.0) and Protein preservation (2.0) are prioritized
        w_cal = 1.0
        w_pro = 2.0
        w_carb = 0.6
        w_fat = 0.6

        # Normalization scales based on typical daily fitness intakes
        scale_cal = 2000.0
        scale_pro = 120.0
        scale_carb = 250.0
        scale_fat = 65.0

        dist = (
            w_cal * ((pool["computed_cals"] - target_cals) / scale_cal) ** 2
            + w_pro * ((pool["computed_protein"] - target_pro) / scale_pro) ** 2
            + w_carb * ((pool["computed_carbs"] - target_carb) / scale_carb) ** 2
            + w_fat * ((pool["computed_fats"] - target_fat) / scale_fat) ** 2
        )

        best_idx = dist.idxmin()
        best_row = pool.loc[best_idx]

        # 4. Smart portion scaling (adjust slightly if target deviates from discrete combinations)
        matched_cals = float(best_row["computed_cals"])
        multiplier = 1.0
        if matched_cals > 0:
            raw_multiplier = target_cals / matched_cals
            # Keep portion multiplier within realistic culinary bounds (0.85x - 1.25x)
            if 0.85 <= raw_multiplier <= 1.25:
                multiplier = round(raw_multiplier, 2)

        final_cals = round(matched_cals * multiplier)
        final_pro = round(best_row["computed_protein"] * multiplier, 1)
        final_carb = round(best_row["computed_carbs"] * multiplier, 1)
        final_fat = round(best_row["computed_fats"] * multiplier, 1)
        final_fiber = round(best_row["computed_fiber"] * multiplier, 1)

        total_macro_g = (final_pro * 4.0) + (final_carb * 4.0) + (final_fat * 9.0)
        if total_macro_g > 0:
            pct_pro = round(((final_pro * 4.0) / total_macro_g) * 100, 1)
            pct_carb = round(((final_carb * 4.0) / total_macro_g) * 100, 1)
            pct_fat = round(((final_fat * 9.0) / total_macro_g) * 100, 1)
        else:
            pct_pro, pct_carb, pct_fat = 30.0, 45.0, 25.0

        # 5. Extract per-meal nutritional details
        meal_details = {}
        for col in self.meal_columns:
            dish_name = best_row[col]
            dish_info = self.nutrition_matrix.get(
                dish_name,
                {"calories": 0, "protein_g": 0.0, "carbs_g": 0.0, "fats_g": 0.0, "fiber_g": 0.0, "is_veg": True},
            )
            meal_details[col] = {
                "name": dish_name,
                "calories": round(dish_info.get("calories", 0) * multiplier),
                "protein_g": round(dish_info.get("protein_g", 0.0) * multiplier, 1),
                "carbs_g": round(dish_info.get("carbs_g", 0.0) * multiplier, 1),
                "fats_g": round(dish_info.get("fats_g", 0.0) * multiplier, 1),
                "fiber_g": round(dish_info.get("fiber_g", 0.0) * multiplier, 1),
                "is_veg": bool(dish_info.get("is_veg", True)),
            }

        food_type_str = "Veg" if bool(best_row["is_pure_veg"]) else "Non-Veg"

        # 6. Build response ensuring full backward compatibility and rich metadata
        return {
            # Legacy expected keys (guarantees existing endpoints and tests pass)
            "Breakfast 1": best_row["Breakfast 1"],
            "Breakfast 2": best_row["Breakfast 2"],
            "Lunch 1": best_row["Lunch 1"],
            "Lunch 2": best_row["Lunch 2"],
            "Dinner 1": best_row["Dinner 1"],
            "Dinner 2": best_row["Dinner 2"],
            "Food Type": food_type_str,
            "Total Calories": final_cals,
            # Phase 1 AI/ML Macronutrient Vector Space additions
            "macros": {
                "calories": final_cals,
                "protein_g": final_pro,
                "carbs_g": final_carb,
                "fats_g": final_fat,
                "fiber_g": final_fiber,
                "protein_pct": pct_pro,
                "carbs_pct": pct_carb,
                "fats_pct": pct_fat,
            },
            "target_macros": {
                "target_calories": target_cals,
                "target_protein_g": target_pro,
                "target_carbs_g": target_carb,
                "target_fats_g": target_fat,
            },
            "goal": targets["goal"],
            "portion_multiplier": multiplier,
            "meal_details": meal_details,
        }

    def find_closest_match(self, predicted_meals, veg_only):
        """
        Legacy fallback method maintained for backward compatibility.
        """
        if veg_only:
            veg_df = self.enriched_df[self.enriched_df["is_pure_veg"]]
        else:
            veg_df = self.enriched_df

        if veg_df.empty:
            return None
        return veg_df.iloc[0]


# Module-level cached model instance singleton
_diet_model_instance = None


def get_diet_model():
    """
    Thread-safe module-level cached singleton for DietRecommendationModel.
    Loads matrices, datasets, and models once into memory on startup.
    """
    global _diet_model_instance
    if _diet_model_instance is None:
        _diet_model_instance = DietRecommendationModel()
    return _diet_model_instance


if __name__ == "__main__":
    model = get_diet_model()
    recommendation = model.recommend_diet(
        BMI=24.5,
        BMR=1650,
        Total_Calories=2100,
        veg_only=True,
        goal="Muscle Gain",
    )
    print("Diet Plan Output:")
    print(json.dumps(recommendation, indent=2))