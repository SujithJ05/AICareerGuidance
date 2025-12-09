"use client";
import { useState } from "react";

export default function EditCourseModal({ open, onClose, course, onSave }) {
  const [title, setTitle] = useState(course?.title || "");
  const [desc, setDesc] = useState(course?.desc || "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          Edit Course Title & Description
        </h2>
        <label className="block font-medium mb-2">Course Title</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block font-medium mb-2">Description</label>
        <textarea
          className="w-full border p-2 rounded mb-6"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white"
            onClick={() => onSave({ title, desc })}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
