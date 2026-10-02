import { Router } from "express";
import { database } from "../database";
import type { Category } from "../entities/Category";

const router = Router();

function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parseCategoryInput(body: unknown): { name: string; parentCategoryId: number | null } | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) return null;

    const input = body as Record<string, unknown>;
    const parentCategoryId = input.parentCategoryId === undefined ? null : input.parentCategoryId;
    if (typeof input.name !== "string" || input.name.trim().length === 0) return null;
    if (parentCategoryId !== null && (typeof parentCategoryId !== "number" || !Number.isSafeInteger(parentCategoryId) || parentCategoryId <= 0)) return null;

    return { name: input.name.trim(), parentCategoryId };
}

function getCategory(id: number): Category | null {
    return database.query<Category, [number]>(`
        SELECT id, name, parent_category_id AS parentCategoryId
        FROM categories
        WHERE id = ?
    `).get(id) ?? null;
}

function parentExists(id: number): boolean {
    return database.query("SELECT id FROM categories WHERE id = ?").get(id) !== null;
}

function createsCycle(categoryId: number, parentCategoryId: number): boolean {
    let currentId: number | null = parentCategoryId;
    while (currentId !== null) {
        if (currentId === categoryId) return true;
        const parent = database.query<{ parentCategoryId: number | null }, [number]>(`
            SELECT parent_category_id AS parentCategoryId
            FROM categories
            WHERE id = ?
        `).get(currentId);
        currentId = parent?.parentCategoryId ?? null;
    }
    return false;
}

router.get("/", (_request, response) => {
    const categories = database.query<Category, []>(`
        SELECT id, name, parent_category_id AS parentCategoryId
        FROM categories
        ORDER BY name COLLATE NOCASE, id
    `).all();
    response.json(categories);
});

router.get("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid category id" });

    const category = getCategory(id);
    if (!category) return response.status(404).json({ error: "Category not found" });
    response.json(category);
});

router.post("/", (request, response) => {
    const input = parseCategoryInput(request.body);
    if (!input) return response.status(400).json({ error: "name and a valid parentCategoryId are required" });
    if (input.parentCategoryId !== null && !parentExists(input.parentCategoryId)) {
        return response.status(400).json({ error: "Parent category not found" });
    }

    const result = database.query("INSERT INTO categories (name, parent_category_id) VALUES (?, ?)").run(input.name, input.parentCategoryId);
    response.status(201).json(getCategory(Number(result.lastInsertRowid)));
});

router.put("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid category id" });

    const input = parseCategoryInput(request.body);
    if (!input) return response.status(400).json({ error: "name and a valid parentCategoryId are required" });
    if (input.parentCategoryId !== null && !parentExists(input.parentCategoryId)) {
        return response.status(400).json({ error: "Parent category not found" });
    }
    if (!getCategory(id)) return response.status(404).json({ error: "Category not found" });
    if (input.parentCategoryId !== null && createsCycle(id, input.parentCategoryId)) {
        return response.status(400).json({ error: "Parent category would create a cycle" });
    }

    database.query("UPDATE categories SET name = ?, parent_category_id = ? WHERE id = ?").run(input.name, input.parentCategoryId, id);
    response.json(getCategory(id));
});

router.delete("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid category id" });
    if (!getCategory(id)) return response.status(404).json({ error: "Category not found" });

    database.query("DELETE FROM categories WHERE id = ?").run(id);
    response.status(204).end();
});

export default router;
