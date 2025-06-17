import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: true, // Enable fetching to check auth status
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
