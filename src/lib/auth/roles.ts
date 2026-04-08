export const SUPER_ADMIN_EMAIL = "wms-admin@gmail.com"

export const isSuperAdminEmail = (email?: string | null): boolean => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL
}
