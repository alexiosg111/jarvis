export function isDev(): boolean {
  return process.env.NODE_ENV === 'development' || process.defaultApp || /[\\/]electron/.test(process.execPath);
}
