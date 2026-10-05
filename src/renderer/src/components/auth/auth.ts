/**
 * Temporary hardcoded authentication.
 *
 * `authenticate` is async on purpose: when this gets replaced with a real
 * check (IPC to the main process, API call, etc.) the signature and every
 * caller stay the same.
 */
const CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
} as const

export async function authenticate(username: string, password: string): Promise<boolean> {
  return username.trim() === CREDENTIALS.username && password === CREDENTIALS.password
}