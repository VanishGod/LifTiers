import SearchIcon from "@/icons/SearchIcon";
import { useState, useRef, useEffect } from "react";

interface SearchItemsProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchItems = ({ 
  value, 
  onSearch, 
  placeholder = "¿Qué ejercicio buscas?" 
}: SearchItemsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isOpen) onSearch("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        onSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onSearch]);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      onSearch("");
    }
  };

  return (
    <div className="flex items-center justify-center p-2.5 w-full">
      <div 
        ref={containerRef}
        className={`
          flex flex-row items-center
          border border-black rounded-sm
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-65' : 'w-10'}
          overflow-hidden
        `}
      >
        <button
          type="button"
          onClick={toggleSearch}
          className={`
            flex items-center justify-center 
            w-10 h-10 shrink-0
            transition-colors duration-200
            hover:bg-black
            ${isOpen ? 'border-r border-r-black' : ''}
          `}
          aria-label={isOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
          aria-expanded={isOpen}
        >
          <SearchIcon 
            size={25} 
            className={`
              transition-colors duration-200
              hover:text-white
              ${isOpen ? 'text-black' : 'text-black'}
            `}
          />
        </button>

        <div className={`
          flex items-center h-10
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}
          overflow-hidden
        `}>
          <input
            ref={inputRef}
            type="search"
            className="
              outline-none border-0 
              w-full h-full 
              bg-transparent
              px-2
              text-sm
              placeholder:text-gray-400
            "
            placeholder={placeholder}
            value={value}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Campo de búsqueda"
          />
        </div>
      </div>
    </div>
  );
};