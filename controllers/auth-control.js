export const authController = (req, res) => {
  if (!req.body || !req.body.pw) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  //pw check
  if (req.body.pw !== process.env.PW) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  // auth pw
  req.session.authenticated = true;
  res.json({ success: true, redirect: "/" });
};

export const adminAuthController = (req, res) => {
  // console.log("ADMIN AUTH CONTROLLER");
  // console.log(req.body);
  if (!req.body || !req.body.pw) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  // admin pw check
  if (req.body.pw !== process.env.ADMIN_PW) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  // console.log("ADMIN AUTH CONTROLLER LATER");
  // console.log(req.body);

  // set admin auth
  req.session.isAdmin = true;
  return res.json({ success: true, redirect: "/" });
};

export const checkAdminAuthController = (req, res) => {
  // console.log("CHECK ADMIN AUTH CONTROLLER");
  // console.log(req.session.isAdmin);
  res.json({ isAdmin: !!req.session.isAdmin, redirect: "/admin-auth-display" });
};
