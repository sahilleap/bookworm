"use client"
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBooks = useCallback(
    async (_search: string, _page: number) => {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(_search)}&page=${_page}`);
          const data = await response.json();
          if (_page === 1) {
            setBooks(data.docs);
            setHasMore(data.docs.length < data.numFound);
          } else {
            setBooks((prevValue: any[]) => [...prevValue, ...data.docs]);
            setHasMore(data.docs.length < data.numFound);
          }
        } catch (error) {
          setError("Failed to fetch books. Please try again.");
          setLoading(false);
          setBooks([]);
        }
    },
    [books],
  )

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    await fetchBooks(debouncedSearch, 1);
    setLoading(false);
  };

  const onChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  useEffect(() => {
    handleSearch()
  }, [debouncedSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleScroll = useCallback(
    async (data: React.UIEvent<HTMLDivElement>) => {
      console.log(
        "scroll",
        data.currentTarget.scrollTop + data.currentTarget.clientHeight,
        data.currentTarget.scrollHeight - 100
      );
      if (
        (
          data.currentTarget.scrollTop + data.currentTarget.clientHeight >=
          data.currentTarget.scrollHeight - 100
        ) && 
        hasMore
      ) {
        await fetchBooks(debouncedSearch, page +1);
        setPage(page + 1);
      }
    },
    [debouncedSearch, page, hasMore]
  );

  return (
    <div className="flex flex-col h-screen p-10 bg-zinc-50 font-sans dark:bg-black overflow-y-auto">
      <div className="flex flex-row gap-2 mb-4">
        <input 
          type="text"
          placeholder="Search for a book"
          className="w-full p-2 rounded-md border border-gray-300"
          value={search}
          onChange={onChangeText}
        />
      </div>
      {debouncedSearch.length > 0 && (
        <div className="flex flex-col gap-2 overflow-y-auto h-full" onScrollEndCapture={handleScroll}>
          {loading && <div className="flex justify-center items-center h-full">Loading...</div>}
          {error && <div className="flex justify-center items-center h-full">{error}</div>}
          {!error && (
            books.length === 0 ? (
              <div className="flex justify-center items-center h-full">No books found</div>
            ) :(
              books.map((book: any, index: number) => 
                <div key={index} className="flex flex-col gap-2 border-2 p-4 border-radius mb-2">
                  <h1 className="text-xl font-bold">{book?.title}</h1>
                  <p className="text-gray-500">{book?.author_name?.join(", ")}</p>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
}
