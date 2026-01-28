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
  if (!req.body || !req.body.pw) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  // admin pw check
  if (req.body.pw !== process.env.ADMIN_PW) {
    res.json({ success: false, redirect: "/401" });
    return;
  }

  // set admin auth
  req.session.isAdmin = true;
  res.json({ success: true, redirect: "/" });
};

export const checkAdminAuthController = (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
};
