router.get(
  "/dashboard",
  auth,
  role("admin"),
  dashboard
);