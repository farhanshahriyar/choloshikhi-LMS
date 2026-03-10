import { categories } from "@/lib/mock-data";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(selected === cat.name ? null : cat.name)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${
            selected === cat.name
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-accent"
          }`}
        >
          <span>{cat.emoji}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
