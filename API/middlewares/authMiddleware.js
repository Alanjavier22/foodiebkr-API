import decodeToken from "../../utils/decodeToken.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    
    // decodeToken lanzará un error 401 si no es válido
    if (!token) {
        throw new Error("Se requiere token de autenticación");
    }
    
    decodeToken(token);
    
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};
