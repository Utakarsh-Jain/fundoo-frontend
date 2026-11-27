import Icon from "./Icon";

/*
 * Component Name : ActionButton
 * Description    : Renders a consistent icon-and-label action button.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

function ActionButton({
    icon,
    label,
    ariaLabel,
    onClick,
    disabled = false,
    className = ""
}) {
    const buttonClassName = ["action-btn", className]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            className={buttonClassName}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || label}
            title={ariaLabel || label}
        >
            <Icon name={icon} size={16} />
            <span>{label}</span>
        </button>
    );
}

export default ActionButton;
