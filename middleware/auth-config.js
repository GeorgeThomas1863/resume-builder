import path from "path";

const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.sendFile(path.join(process.cwd(), "html", "auth.html"));
  }
};

export const requireAdminAuth = (req, res, next) => {
  // console.log("REQUIRE ADMIN AUTH");
  // console.log(req.session.isAdmin);
  if (req.session.isAdmin) {
    next();
  } else {
    res.sendFile(path.join(process.cwd(), "html", "admin-auth.html"));
  }
};

export default requireAuth;
