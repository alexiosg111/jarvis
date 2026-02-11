export const isDev = () =>
  process.env.NODE_ENV === "development" || !!process.env.VITE_DEV_SERVER_URL;
