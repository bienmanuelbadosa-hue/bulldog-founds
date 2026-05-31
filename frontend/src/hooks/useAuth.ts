/**
 * useAuth hook — re-exports the auth hook from AuthContext.
 *
 * Centralises the hook import path so consumers use:
 *   import { useAuth } from '../hooks/useAuth';
 * instead of reaching into context/ directly.
 */
export { useAuth } from '../context/AuthContext';
