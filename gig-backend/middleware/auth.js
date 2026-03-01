import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token from Supabase Auth
 * Extracts user information from the token and attaches it to req.user
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Decode the JWT token (Supabase tokens are self-contained)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ error: "Token expired" });
    }

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Token verification failed" });
  }
};
