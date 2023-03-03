export const endpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const routes = {
  v1: {
    health: "/v1/health",
    instagram: {
      me: "/v1/instagram/@me",
    }
  }
}

export const buildUrl = (route: string) => {
  return `${endpoint}${route}`;
}

export const fetcher = (route: string, init?: RequestInit | undefined) => fetch(buildUrl(route), init).then(res => res.json())
