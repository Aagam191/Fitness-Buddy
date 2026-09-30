from ..ml_utils import get_diet_model


class DietService:
    """
    Domain service for diet recommendation calculations and ML model execution.
    """

    @staticmethod
    def calculate_diet_plan(
        bmi: float,
        bmr: float,
        total_calories: float,
        veg_only: bool = False,
        goal: str = None,
    ):
        """
        Executes the in-memory cached DietRecommendationModel singleton with
        Macronutrient Vector Space matching.
        """
        model = get_diet_model()
        recommendation = model.recommend_diet(
            BMI=bmi,
            BMR=bmr,
            Total_Calories=total_calories,
            veg_only=veg_only,
            goal=goal,
        )
        return recommendation
