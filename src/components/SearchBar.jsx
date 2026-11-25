/*
 * Component Name : SearchBar
 * Description    : Provides a search input for filtering notes.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function SearchBar({ searchQuery, setSearchQuery }) {

    // Updates the search query.
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearch}
        />
    );
}

export default SearchBar;