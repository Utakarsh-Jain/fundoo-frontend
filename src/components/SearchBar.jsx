/*
 * Component Name : SearchBar
 * Description    : Provides a search input for filtering notes.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function SearchBar({ searchQuery, setSearchQuery }) {

    return (
        <div style={{ position: "relative" }}>
            <span className="search-icon">⌕</span>
            <input
                className="input"
                type="text"
                placeholder="Search your notes..."
                aria-label="Search notes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;
