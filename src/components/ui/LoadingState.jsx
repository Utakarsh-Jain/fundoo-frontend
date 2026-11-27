/*
 * Component Name : LoadingState
 * Description    : Renders a consistent loading indicator for async views.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

function LoadingState({ label }) {
    return (
        <div className="loading-state" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>{label}</p>
        </div>
    );
}

export default LoadingState;
