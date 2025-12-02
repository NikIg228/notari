"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/lib/constants/categories"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { Category } from "@/lib/constants/categories"

interface DocumentFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: Category | "Все"
  onCategoryChange: (category: Category | "Все") => void
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: DocumentFiltersProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию документа..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Категории:
        </label>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange("Все")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === "Все"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            Все
          </motion.button>
          {CATEGORIES.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

