import axios from "axios"

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Function to check if a route is public
const isPublicRoute = (url: string) => {
  const publicRoutes = [
    "/users/login",
  ]

  return publicRoutes.some((route) => {
    // Remove base URL and check if the path matches
    const path = url.replace(api.defaults.baseURL || "", "")
    return path === route || path.startsWith(route + "/")
  })
}

// Request interceptor to add auth token (except for public routes)
api.interceptors.request.use(
  (config) => {
    // Only add auth token if it's not a public route and we're on client side
    if (!isPublicRoute(config.url || "") && typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only handle 401 errors for non-public routes
    if (
      error.response?.status === 401 &&
      !isPublicRoute(error.config?.url || "")
    ) {
      // Clear token and redirect to login only on client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api
