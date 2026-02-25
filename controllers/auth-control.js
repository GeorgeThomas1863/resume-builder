const siteFailCounts = new Map();   // ip → { count, resetAt }
const adminFailCounts = new Map();  // ip → { count, resetAt }

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 10;

const getEntry = (map, ip) => {
  const now = Date.now();
  const entry = map.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WINDOW_MS; }
  return entry;
};

export const authController = (req, res) => {
  if (!req.body || !req.body.pw) {
    return res.json({ success: false, redirect: "/401" });
  }

  const ip = req.ip;
  const entry = getEntry(siteFailCounts, ip);
  if (entry.count >= RATE_LIMIT) return res.status(429).json({ success: false, redirect: "/401" });

  //pw check
  if (req.body.pw !== process.env.PW) {
    entry.count++;
    siteFailCounts.set(ip, entry);
    return res.json({ success: false, redirect: "/401" });
  }

  siteFailCounts.delete(ip);
  req.session.authenticated = true;
  res.json({ success: true, redirect: "/" });
};

export const adminAuthController = (req, res) => {
  if (!req.body || !req.body.pw) {
    return res.json({ success: false, redirect: "/401" });
  }

  const ip = req.ip;
  const entry = getEntry(adminFailCounts, ip);
  if (entry.count >= RATE_LIMIT) return res.status(429).json({ success: false, redirect: "/401" });

  // admin pw check
  if (req.body.pw !== process.env.ADMIN_PW) {
    entry.count++;
    adminFailCounts.set(ip, entry);
    return res.json({ success: false, redirect: "/401" });
  }

  adminFailCounts.delete(ip);
  req.session.isAdmin = true;
  return res.json({ success: true, redirect: "/" });
};

export const checkAdminAuthController = (req, res) => {
  // console.log("CHECK ADMIN AUTH CONTROLLER");
  // console.log(req.session.isAdmin);
  res.json({ isAdmin: !!req.session.isAdmin });
};
