import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/token";

/*
 * Component Name : ProtectedRoute
 * Description    : Restricts access to routes for unauthenticated users.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function ProtectedRoute() {

    const token = getToken();

    // Redirects unauthenticated users to the login page.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;