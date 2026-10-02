export interface Note {
    id: number;
    content: string;
    categoryId: number | null;
}

export interface Category {
    id: number;
    name: string;
    parentCategoryId: number | null;
}
