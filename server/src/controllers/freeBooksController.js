const axios = require('axios');

// @desc    Get Free Books from Project Gutenberg (Gutendex API)
// @route   GET /api/discover/free
// @access  Public
const getFreeBooks = async (req, res) => {
    try {
        const { page = 1, search = '', topic = '' } = req.query;
        let url = `https://gutendex.com/books/?page=${page}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        if (topic) {
            url += `&topic=${encodeURIComponent(topic)}`;
        }

        const response = await axios.get(url);

        // Format the books to match our frontend structure somewhat
        const formattedBooks = response.data.results.map(book => {
            // Find HTML or EPUB format for reading
            const formats = book.formats || {};
            const readLink = formats['text/html'] || formats['application/epub+zip'] || formats['text/plain'] || '';
            const isEpub = !formats['text/html'] && formats['application/epub+zip'] ? true : false;

            return {
                id: `gutenberg-${book.id}`,
                title: book.title,
                authors: book.authors.map(a => a.name),
                thumbnail: formats['image/jpeg'] || 'https://via.placeholder.com/300x450?text=No+Cover',
                subjects: book.subjects,
                downloadCount: book.download_count,
                readLink,
                isEpub,
                isFree: true,
                source: 'gutenberg'
            };
        });

        res.json({
            count: response.data.count,
            next: response.data.next ? true : false,
            previous: response.data.previous ? true : false,
            results: formattedBooks
        });
    } catch (error) {
        console.error('Gutendex API Error:', error);
        res.status(500).json({ message: 'Failed to fetch free books' });
    }
};

module.exports = {
    getFreeBooks
};
