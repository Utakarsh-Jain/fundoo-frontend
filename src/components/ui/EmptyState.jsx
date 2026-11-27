import Icon from "./Icon";

/*
 * Component Name : EmptyState
 * Description    : Renders a reusable empty-list message with an SVG icon.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

function EmptyState({ icon = "note", title, description }) {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">
                <Icon name={icon} size={26} />
            </span>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </div>
    );
}

export default EmptyState;
