import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Server-backed wishlist. Guests are sent to the login page when they try to
 * save a course; learners get an optimistic toggle that rolls back on failure.
 */
export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [ids, setIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setIds(new Set());
      return;
    }

    let cancelled = false;
    api.wishlist
      .getAll()
      .then((res) => {
        if (!cancelled) setIds(new Set<string>(res.ids || []));
      })
      .catch(() => {
        if (!cancelled) setIds(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const has = useCallback((courseId: string) => ids.has(String(courseId)), [ids]);

  const toggle = useCallback(
    async (courseId: string) => {
      const id = String(courseId);

      if (!isAuthenticated) {
        navigate("/login", {
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      const wasSaved = ids.has(id);
      setError("");

      // Optimistic update
      setIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        if (wasSaved) await api.wishlist.remove(id);
        else await api.wishlist.add(id);
      } catch {
        // Roll back
        setIds((current) => {
          const next = new Set(current);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        setError("Could not update your wishlist. Please try again.");
      }
    },
    [ids, isAuthenticated, navigate, location.pathname, location.search]
  );

  return { ids, has, toggle, error };
}
