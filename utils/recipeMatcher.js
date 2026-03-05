// utils/recipeMatcher.js

export const matchRecipes = (meals = [], pantryItems = []) => {

  const pantrySet = new Set(
    pantryItems.map(item =>
      item.item_name.toLowerCase()
    )
  );

  const suggestions = meals.map(meal => {

    const ingredients = meal.ingredients.map(ing =>
      ing.toLowerCase()
    );

    let matchCount = 0;

    ingredients.forEach(ingredient => {
      if (pantrySet.has(ingredient)) {
        matchCount++;
      }
    });

    const matchPercentage =
      (matchCount / ingredients.length) * 100;

    return {
      ...meal,
      matchCount,
      matchPercentage: Number(matchPercentage.toFixed(0))
    };

  });

  // Only meals with 2 or more matching ingredients
  return suggestions
    .filter(meal => meal.matchCount >= 2)
    .sort((a, b) => b.matchCount - a.matchCount);

};