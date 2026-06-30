import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { date } from "../utils/format";

export default function CommentBox({ comments = [], onSubmit }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const submit = async (values) => {
    await onSubmit(values.comment);
    reset();
  };
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(submit)} className="flex gap-2">
        <input className="input" placeholder="Write a comment" {...register("comment", { required: true })} />
        <button className="btn-primary" disabled={isSubmitting}>
          <Send size={16} />
          Send
        </button>
      </form>
      <div className="space-y-3">
        {comments.length === 0 && <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">No comments yet.</div>}
        {comments.map((item) => (
          <div key={item.comment_id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-mint text-sm font-bold text-white">{item.author_name?.[0]}</div>
              <div>
                <p className="font-semibold">{item.author_name}</p>
                <p className="text-xs text-stone-500">{date(item.created_at)} • {item.author_role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-700">{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
