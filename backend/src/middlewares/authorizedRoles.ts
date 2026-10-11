import appError from "../utils/appError";

const authorizedRoles = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You are not authorized to perform this action.", 403),
      );
    }
    next();
  };
};

export default authorizedRoles;
