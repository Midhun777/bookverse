import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookDetails } from "../services/openLibraryService";
import BookCard from './BookCard';

const ChallengeBookCard = ({ googleBookId }) => {
    const { data: bookDetails, isLoading } = useQuery({
        queryKey: ['book', googleBookId],
        queryFn: () => getBookDetails(googleBookId),
        staleTime: 1000 * 60 * 60,
    });

    if (isLoading) return <div className="aspect-[2/3] bg-paper-100 rounded animate-pulse shadow-sm border border-paper-200"></div>;
    if (!bookDetails) return null;

    return <BookCard book={bookDetails} className="w-full" />;
};

export default ChallengeBookCard;
