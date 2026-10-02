import { Router } from "express";
import { database } from "../database";
import type { Note } from "../entities/Note";

const router = Router();

function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parseNoteInput(body: unknown): { content: string; categoryId: number | null } | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) return null;

    const input = body as Record<string, unknown>;
    const categoryId = input.categoryId === undefined ? null : input.categoryId;
    if (typeof input.content !== "string" || input.content.trim().length === 0) return null;
    if (categoryId !== null && (typeof categoryId !== "number" || !Number.isSafeInteger(categoryId) || categoryId <= 0)) return null;

    return { content: input.content, categoryId };
}

function getNote(id: number): Note | null {
    return database.query<Note, [number]>(`
        SELECT id, content, category_id AS categoryId
        FROM notes
        WHERE id = ?
    `).get(id) ?? null;
}

function categoryExists(id: number): boolean {
    return database.query("SELECT id FROM categories WHERE id = ?").get(id) !== null;
}

router.get("/", (_request, response) => {
    const notes = database.query<Note, []>(`
        SELECT id, content, category_id AS categoryId
        FROM notes
        ORDER BY id DESC
    `).all();
    response.json(notes);
});

router.get("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid note id" });

    const note = getNote(id);
    if (!note) return response.status(404).json({ error: "Note not found" });
    response.json(note);
});

router.post("/", (request, response) => {
    const input = parseNoteInput(request.body);
    if (!input) return response.status(400).json({ error: "content and a valid categoryId are required" });
    if (input.categoryId !== null && !categoryExists(input.categoryId)) {
        return response.status(400).json({ error: "Category not found" });
    }

    const result = database.query("INSERT INTO notes (content, category_id) VALUES (?, ?)").run(input.content, input.categoryId);
    response.status(201).json(getNote(Number(result.lastInsertRowid)));
});

router.put("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid note id" });

    const input = parseNoteInput(request.body);
    if (!input) return response.status(400).json({ error: "content and a valid categoryId are required" });
    if (input.categoryId !== null && !categoryExists(input.categoryId)) {
        return response.status(400).json({ error: "Category not found" });
    }
    if (!getNote(id)) return response.status(404).json({ error: "Note not found" });

    database.query("UPDATE notes SET content = ?, category_id = ? WHERE id = ?").run(input.content, input.categoryId, id);
    response.json(getNote(id));
});

router.delete("/:id", (request, response) => {
    const id = parseId(request.params.id);
    if (id === null) return response.status(400).json({ error: "Invalid note id" });
    if (!getNote(id)) return response.status(404).json({ error: "Note not found" });

    database.query("DELETE FROM notes WHERE id = ?").run(id);
    response.status(204).end();
});

export default router;
