/*
 * Component Name : PageHeader
 * Description    : Renders the shared page title, subtitle and item count.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

function PageHeader({ title, description, count, countLabel }) {
    return (
        <header className="page-head">
            <div className="page-head-main">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {count !== undefined && (
                <span className="count-pill">
                    <strong>{count}</strong> {countLabel}
                </span>
            )}
        </header>
    );
}

export default PageHeader;
