/*
 * Component Name : Icon
 * Description    : Renders consistent inline SVG icons for the interface.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

const ICONS = {
    note: (
        <>
            <path d="M6 3h8l4 4v14H6z" />
            <path d="M14 3v5h4" />
            <path d="M9 12h6" />
            <path d="M9 16h4" />
        </>
    ),
    reminder: (
        <>
            <circle cx="12" cy="13" r="7" />
            <path d="M12 9v4l3 2" />
            <path d="M9 4h6" />
        </>
    ),
    archive: (
        <>
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <path d="M5 8v12h14V8" />
            <path d="M10 12h4" />
        </>
    ),
    trash: (
        <>
            <path d="M4 7h16" />
            <path d="M9 7V4h6v3" />
            <path d="M7 7l1 13h8l1-13" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </>
    ),
    attachment: (
        <>
            <path d="M9 12l6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8" />
        </>
    ),
    label: (
        <>
            <path d="M3 12l9-9h7v7l-9 9z" />
            <circle cx="16" cy="8" r="1.5" />
        </>
    ),
    edit: (
        <>
            <path d="M4 20h4l10-10-4-4L4 16z" />
            <path d="M13 7l4 4" />
        </>
    ),
    close: (
        <>
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
        </>
    ),
    restore: (
        <>
            <path d="M9 8H5V4" />
            <path d="M5 8a8 8 0 1 1 1 7" />
        </>
    ),
    pin: (
        <>
            <path d="M9 3h6l-1 5 3 3v2H7v-2l3-3z" />
            <path d="M12 13v8" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l4 4" />
        </>
    ),
    menu: (
        <>
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </>
    ),
    plus: (
        <>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </>
    ),
    minus: (
        <>
            <path d="M5 12h14" />
        </>
    ),
    logout: (
        <>
            <path d="M10 5H5v14h5" />
            <path d="M14 8l4 4-4 4" />
            <path d="M9 12h9" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
    ),
    check: (
        <>
            <path d="M5 12l4 4L19 6" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </>
    ),
    logo: (
        <>
            <rect x="4" y="3" width="16" height="18" rx="3" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </>
    )
};

// Renders the requested SVG icon with shared sizing and accessibility defaults.
function Icon({ name, size = 18, className = "" }) {
    const icon = ICONS[name] || ICONS.note;
    const iconClassName = ["icon", className].filter(Boolean).join(" ");

    return (
        <svg
            className={iconClassName}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {icon}
        </svg>
    );
}

export default Icon;
