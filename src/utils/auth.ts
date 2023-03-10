import * as jwt from "jsonwebtoken";

export interface AuthTokenPayload {
    userId: number;
};

export const decodeAuthHeader = (authHeader: String): AuthTokenPayload => {
   const token = authHeader.replace("Bearer ", "");
   if(!token) {
     throw new Error("Missing bearer token");  
   };

   try {
     return jwt.verify(token, process.env.APP_SECRET) as AuthTokenPayload;
   } catch (error) {
     throw error;
   }
}

export const generateJwtToken = async (userId: number) => {
  return await jwt.sign({ userId, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, process.env.APP_SECRET);
};