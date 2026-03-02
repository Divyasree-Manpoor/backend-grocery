// utils/recipeMatcher.js

export const matchRecipes = (meals = [], pantryItems = []) => {
  const pantrySet = new Set(
    pantryItems.map((item) => item.item_name.toLowerCase())
  );

  const suggestions = meals.map((meal) => {
    const ingredients = meal.ingredients.map((ing) =>
      ing.toLowerCase()
    );

    let matchCount = 0;

    ingredients.forEach((ingredient) => {
      if (pantrySet.has(ingredient)) {
        matchCount++;
      }
    });

    const matchPercentage =
      (matchCount / ingredients.length) * 100;

    return {
      ...meal,
      matchPercentage: Number(matchPercentage.toFixed(0)),
    };
  });

  // Sort by best match
  return suggestions
    .filter((meal) => meal.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};