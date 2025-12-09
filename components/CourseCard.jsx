import { BookOpen, User, Clock, Film } from "lucide-react";
import EditCourseModal from "./EditCourseModal";
import ChapterProgress from "./ChapterProgress";
import { useState } from "react";

export default function CourseCard({
  title,
  category,
  chapters,
  difficulty,
  image,
  desc,
  onEdit,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <img src={image} alt={category} className="h-16 w-16 rounded" />
        <div>
          <h2 className="text-xl font-bold mb-1">{title}</h2>
          <p className="text-gray-600 text-sm mb-2">{desc}</p>
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {category}
          </span>
        </div>
      </div>
      <div className="flex gap-6 mt-2 text-sm text-gray-700">
        <div className="flex items-center gap-1">
          <BookOpen size={16} /> {chapters} Chapters
        </div>
        <div className="flex items-center gap-1">
          <User size={16} /> {difficulty}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={16} /> 1 hour
        </div>
        <div className="flex items-center gap-1">
          <Film size={16} /> Yes
        </div>
      </div>
      <ChapterProgress chapters={chapters} />
      <button
        className="mt-4 px-4 py-2 rounded bg-purple-600 text-white self-end"
        onClick={() => setModalOpen(true)}
      >
        Edit
      </button>
      <EditCourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        course={{ title, desc }}
        onSave={(updated) => {
          setModalOpen(false);
          if (onEdit) onEdit(updated);
        }}
      />
    </div>
  );
}
