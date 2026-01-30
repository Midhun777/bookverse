import axios from 'axios';
import api from './api'; // Import internal API instance

const OL_BASE_URL = 'https://openlibrary.org';

export const getBookDetails = async (bookId) => {
    try {
        // 1. Try fetching from Local Backend (BookMaster)
        // This handles seeded books (Google Books data) or cached books
        try {
            const localRes = await api.get(`/books/${bookId}`);
            if (localRes.data) {
                const book = localRes.data;
                // Map BookMaster schema to Frontend/Google-like structure
                return {
                    id: book.openLibraryId, // This might be a Google ID or OL ID
                    volumeInfo: {
                        title: book.title,
                        authors: book.authors || ['Unknown'],
                        description: book.description,
                        imageLinks: {
                            thumbnail: book.coverImage
                        },
                        categories: book.subjects || [],
                        averageRating: book.averageRating,
                        ratingsCount: book.ratingsCount,
                        publishedDate: book.firstPublishYear?.toString(),
                        pageCount: book.pageCount
                    },
                    accessInfo: {
                        embeddable: false
                    }
                };
            }
        } catch (localErr) {
            // Ignore 404 (not in local DB) and fall through to external API
            if (localErr.response && localErr.response.status !== 404) {
                console.error('Local DB Error:', localErr);
            }
        }

        // 2. Fallback to OpenLibrary (External API)
        // Normalize ID: Ensure it starts with /works/ for API calls
        const apiId = bookId.startsWith('/works/') ? bookId : `/works/${bookId}`;

        // 1. Fetch Metadata (Authors, Ratings, Covers) via Search API
        // This is more efficient for author names than fetching individual author endpoints
        const searchRes = await axios.get(`${OL_BASE_URL}/search.json`, {
            params: {
                q: `key:${apiId}`,
                limit: 1
            }
        });

        const searchData = searchRes.data.docs ? searchRes.data.docs[0] : null;
        if (!searchData) throw new Error('Book not found in OpenLibrary');

        // 2. Fetch Description via Works API
        // Search API doesn't standardize description
        let description = 'No description available.';
        try {
            const workRes = await axios.get(`${OL_BASE_URL}${apiId}.json`);
            if (workRes.data.description) {
                description = typeof workRes.data.description === 'string'
                    ? workRes.data.description
                    : workRes.data.description.value;
            }
        } catch (err) {
            console.warn('Could not fetch description', err);
        }

        // 3. Format to match Google Books structure (approximately) to minimize refactor
        const { title, author_name, cover_i, subject, ratings_average, ratings_count, first_publish_year } = searchData;

        return {
            id: bookId,
            volumeInfo: {
                title: title,
                authors: author_name || ['Unknown'],
                description: description,
                // Use large cover for details
                imageLinks: {
                    thumbnail: cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg` : 'https://via.placeholder.com/300x450?text=No+Cover'
                },
                categories: subject ? subject.slice(0, 5) : [],
                averageRating: ratings_average ? parseFloat(ratings_average.toFixed(1)) : null,
                ratingsCount: ratings_count || 0,
                publishedDate: first_publish_year ? first_publish_year.toString() : 'N/A',
                pageCount: searchData.number_of_pages_median || 'N/A'
            },
            accessInfo: {
                embeddable: false, // OL Reader is different, disabling for now
                viewability: 'PARTIAL'
            }
        };

    } catch (error) {
        console.error('OpenLibrary Service Error:', error);
        throw error;
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await axios.get(`${OL_BASE_URL}/search.json`, {
            params: {
                q: query,
                limit: 20
            }
        });

        const items = response.data.docs.map(doc => ({
            id: doc.key,
            volumeInfo: {
                title: doc.title,
                authors: doc.author_name || ['Unknown'],
                imageLinks: {
                    thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'https://via.placeholder.com/128x192?text=No+Cover'
                },
                categories: doc.subject ? doc.subject.slice(0, 3) : [],
                averageRating: doc.ratings_average ? parseFloat(doc.ratings_average.toFixed(1)) : null,
                ratingsCount: doc.ratings_count
            }
        }));

        return { items };

    } catch (error) {
        console.error('Search Error:', error);
        return { items: [] };
    }
};
