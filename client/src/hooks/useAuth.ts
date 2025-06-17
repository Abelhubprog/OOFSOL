import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable automatic fetching since pages are public
  });

  return {
    user,
    isLoading: false, // Never show loading state for public pages
    isAuthenticated: !!user,
  };
}
