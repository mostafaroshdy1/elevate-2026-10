import { verifyJwt } from "./jwt.js";
import { UnauthorizedError } from "./error/app.error.js";
import { env } from "../../config/env.js";
import { TokenTypesEnum } from "../types/decode.token.types.js";

export const decodeToken = ({
  authorization,
  tokenType = TokenTypesEnum.ACCESS,
}: {
  authorization: string;
  tokenType?: TokenTypesEnum;
}) => {
  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed authorization header");
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Token not provided");
  }

  let privateKey = "";
  if (tokenType === TokenTypesEnum.ACCESS) {
    privateKey = env.JWT_ACCESS_SECRET;
  } else if (tokenType === TokenTypesEnum.REFRESH) {
    privateKey = env.JWT_REFRESH_SECRET;
  }

  const payload = verifyJwt({ token, privateKey });

  return payload;
};
