import Icon from "./Icon";

/*
 * Component Name : AuthHero
 * Description    : Renders the shared authentication page introduction panel.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

function AuthHero({ title, description, tags = [] }) {
    return (
        <section className="auth-hero">
            <div className="auth-logo">
                <span className="auth-logo-mark">
                    <Icon name="logo" size={20} />
                </span>
                Fundoo Notes
            </div>

            <div className="auth-hero-copy">
                <h1>{title}</h1>
                <p>{description}</p>
                <div className="auth-hero-tags">
                    {tags.map((tag) => (
                        <span key={tag.label}>
                            <Icon name={tag.icon} size={15} />
                            {tag.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="auth-hero-footer">
                Simple, focused and made for your everyday thoughts.
            </div>
        </section>
    );
}

export default AuthHero;
