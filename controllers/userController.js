import supabase from "../config/supabase.js";

/* ==========================
   UPDATE FITNESS GOAL
========================== */

export const updateFitnessGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fitness_goal } = req.body;

    const { error } = await supabase
      .from("users")
      .update({ fitness_goal })
      .eq("id", userId);

    if (error) throw error;

    res.json({
      message: "Fitness goal updated successfully",
    });

  } catch (err) {
    console.error("Fitness Goal Error:", err);
    res.status(500).json({ error: err.message });
  }
};