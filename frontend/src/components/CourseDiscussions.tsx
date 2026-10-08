import { useEffect, useState } from "react";
import { MessageSquare, Send, Reply, User as UserIcon, CheckCircle } from "lucide-react";
import { api, getErrorMessage } from "../services/api";
import { Notice, Loading } from "./Notice";
import "./CourseDiscussions.css";

interface CourseDiscussionsProps {
  courseId: string;
  lessonId?: string;
}

export default function CourseDiscussions({ courseId, lessonId }: CourseDiscussionsProps) {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.learn.getDiscussions(courseId, lessonId);
      setThreads(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load discussions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      load();
    }
  }, [courseId, lessonId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      await api.learn.createDiscussion(courseId, newQuestion, lessonId);
      setNewQuestion("");
      await load();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to post question."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await api.learn.createReply(threadId, replyContent);
      setReplyingTo(null);
      setReplyContent("");
      await load();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to post reply."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Loading Q&A..." />;
  if (error) return <Notice message={error} onRetry={load} />;

  return (
    <div className="course-discussions">
      <div className="cd-header">
        <h2><MessageSquare size={20} /> Course Q&A</h2>
        <p>Ask questions and discuss with the instructor and other students.</p>
      </div>

      <form className="cd-ask-form" onSubmit={handleAskQuestion}>
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="What's on your mind? Ask a question..."
          disabled={submitting}
        />
        <div className="cd-form-actions">
          <button type="submit" disabled={!newQuestion.trim() || submitting} className="ev-btn">
            <Send size={16} /> Post Question
          </button>
        </div>
      </form>

      <div className="cd-thread-list">
        {threads.length === 0 ? (
          <div className="cd-empty">No questions yet. Be the first to ask!</div>
        ) : (
          threads.map((thread) => (
            <div key={thread._id} className="cd-thread">
              <div className="cd-message main-question">
                <div className="cd-avatar">
                  {thread.user?.avatarUrl ? (
                    <img src={thread.user.avatarUrl} alt="" />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </div>
                <div className="cd-content">
                  <div className="cd-author">
                    <strong>{thread.user?.name || "Student"}</strong>
                    <span className="cd-time">{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="cd-text">{thread.content}</div>
                </div>
              </div>

              <div className="cd-replies">
                {thread.replies?.map((reply: any) => (
                  <div key={reply._id} className={`cd-message ${reply.isInstructorResponse ? 'instructor-reply' : ''}`}>
                    <div className="cd-avatar small">
                      {reply.user?.avatarUrl ? (
                        <img src={reply.user.avatarUrl} alt="" />
                      ) : (
                        <UserIcon size={18} />
                      )}
                    </div>
                    <div className="cd-content">
                      <div className="cd-author">
                        <strong>{reply.user?.name || "Student"}</strong>
                        {reply.isInstructorResponse && <span className="cd-badge"><CheckCircle size={12} /> Instructor</span>}
                        <span className="cd-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="cd-text">{reply.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              {replyingTo === thread._id ? (
                <form className="cd-reply-form" onSubmit={(e) => handleReply(e, thread._id)}>
                  <textarea
                    autoFocus
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    disabled={submitting}
                  />
                  <div className="cd-form-actions">
                    <button type="button" className="ev-btn ev-btn-outline" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={!replyContent.trim() || submitting} className="ev-btn">
                      Post Reply
                    </button>
                  </div>
                </form>
              ) : (
                <button type="button" className="cd-reply-btn" onClick={() => setReplyingTo(thread._id)}>
                  <Reply size={16} /> Reply to this discussion
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
