"use client";

import { useState, KeyboardEvent, useEffect } from "react";

interface CategoryItem {
  id: number;
  name: string;
}

interface CategoryInputProps {
  title: string;
  items: CategoryItem[];
  onAdd: (name: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  placeholderText?: string;
}

export default function CategoryInput({
  title,
  items,
  onAdd,
  onDelete,
  placeholderText = "이름 입력 후 엔터",
}: CategoryInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      setIsAdding(true);
      setError(null);

      try {
        await onAdd(inputValue.trim());
        setInputValue("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "추가 중 오류가 발생했습니다"
        );
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;

    try {
      await onDelete(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isAdding}
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => inputValue.trim() && onAdd(inputValue.trim())}
            disabled={!inputValue.trim() || isAdding}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-r disabled:opacity-50"
          >
            {isAdding ? "추가 중..." : "추가"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          입력 후 엔터를 누르면 자동으로 추가됩니다
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center text-sm"
          >
            <span>{item.name}</span>
            {onDelete && (
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
