/**
 * Проверка авторизации пользователя
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const authStatus = localStorage.getItem("isAuthenticated")
  const authTimestamp = localStorage.getItem("authTimestamp")

  if (!authStatus || authStatus !== "true") {
    return false
  }

  // Проверяем, не истекла ли сессия (24 часа)
  if (authTimestamp) {
    const timestamp = parseInt(authTimestamp, 10)
    const now = Date.now()
    const hours24 = 24 * 60 * 60 * 1000

    if (now - timestamp > hours24) {
      // Сессия истекла
      logout()
      return false
    }
  }

  return true
}

/**
 * Выход из системы
 */
export function logout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("authTimestamp")
}

/**
 * Обновление времени авторизации
 */
export function refreshAuth(): void {
  if (typeof window === "undefined") return

  if (isAuthenticated()) {
    localStorage.setItem("authTimestamp", Date.now().toString())
  }
}

/**
 * Проверка авторизации администратора
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const authStatus = localStorage.getItem("isAdminAuthenticated")
  const authTimestamp = localStorage.getItem("adminAuthTimestamp")

  if (!authStatus || authStatus !== "true") {
    return false
  }

  // Проверяем, не истекла ли сессия (24 часа)
  if (authTimestamp) {
    const timestamp = parseInt(authTimestamp, 10)
    const now = Date.now()
    const hours24 = 24 * 60 * 60 * 1000

    if (now - timestamp > hours24) {
      // Сессия истекла
      adminLogout()
      return false
    }
  }

  return true
}

/**
 * Выход из административной панели
 */
export function adminLogout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("isAdminAuthenticated")
  localStorage.removeItem("adminAuthTimestamp")
}

/**
 * Обновление времени административной авторизации
 */
export function refreshAdminAuth(): void {
  if (typeof window === "undefined") return

  if (isAdminAuthenticated()) {
    localStorage.setItem("adminAuthTimestamp", Date.now().toString())
  }
}

