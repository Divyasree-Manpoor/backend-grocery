import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, invalid token format",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Not authorized, invalid token payload",
      });
    }

    // 4️⃣ Attach user to request
    req.user = {
      id: decoded.id,
    };

    next();

    
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token expired or invalid",
    });
  }
};