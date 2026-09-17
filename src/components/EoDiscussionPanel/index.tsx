import type { FormEvent } from "react";
import { useEoDiscussion, type ResolutionStatus } from "../../hooks/useEoDiscussion";
import type { DiscussionEvent, DiscussionStatus } from "../../types/api";
import { errorMessage, formatDateTime } from "../../utils/format";
import RequiredMark from "../RequiredMark";
import styles from "./style.module.css";

interface Props {
  publicId: string;
  itemId: string;
  canResolve: boolean;
}

const eventLabels: Record<DiscussionEvent["type"], string> = {
  comment: "의견",
  resolved: "처리 확정",
  reopened: "재활성화",
};

const statusLabels: Record<DiscussionStatus, string> = {
  active: "활성",
  modified: "수정 완료",
  not_required: "수정 불필요",
};

export default function EoDiscussionPanel({ publicId, itemId, canResolve }: Props) {
  const controller = useEoDiscussion({ publicId, itemId });

  if (controller.isLoading) {
    return <div className={styles.panel}><p className="page-state">의견 이력을 불러오는 중...</p></div>;
  }
  if (controller.loadError) {
    return <div className={styles.panel}><p className="alert alert--error">{errorMessage(controller.loadError)}</p></div>;
  }
  if (!controller.discussion) return null;

  const { discussion, events, comment, resolution, reopen } = controller;

  const handleComment = async (event: FormEvent) => {
    event.preventDefault();
    await comment.submit();
  };

  const handleResolve = async (event: FormEvent) => {
    event.preventDefault();
    await resolution.submit();
  };

  const handleReopen = async () => {
    if (!window.confirm("이 EO를 다시 활성화하시겠습니까? 기존 이력은 유지됩니다.")) return;
    await reopen.submit();
  };

  return (
    <div className={styles.panel}>
      {discussion.status !== "active" ? (
        <div className={styles.resolution}>
          <strong>{statusLabels[discussion.status]}</strong>
          {discussion.resolution_reason ? <p>{discussion.resolution_reason}</p> : null}
          <p>{formatDateTime(discussion.resolved_at)}에 확정되었습니다.</p>
          {canResolve ? (
            <button className="button" type="button" onClick={handleReopen} disabled={controller.isMutating}>
              {reopen.isSubmitting ? "재활성화 중..." : "다시 활성화"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.history}>
        <h4>의견 및 처리 이력 ({events.length})</h4>
        {events.length ? events.map((event) => <DiscussionEventItem key={event.id} event={event} />) : (
          <p className={styles.empty}>아직 등록된 의견이 없습니다.</p>
        )}
      </div>

      {discussion.status === "active" ? (
        <form className={styles.form} onSubmit={handleComment}>
          <label>
            <span>의견 작성<RequiredMark /></span>
            <textarea
              value={comment.value}
              onChange={(event) => comment.setValue(event.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="EO에 대한 확인 내용이나 요청 사항을 입력하세요."
              required
            />
          </label>
          <div className={styles.formFooter}>
            <span>{comment.value.length.toLocaleString()} / 5,000</span>
            <button className="button button--primary" type="submit" disabled={!comment.canSubmit}>
              {comment.isSubmitting ? "등록 중..." : "의견 등록"}
            </button>
          </div>
        </form>
      ) : null}

      {canResolve && discussion.status === "active" ? (
        <form className={`${styles.form} ${styles.resolveForm}`} onSubmit={handleResolve}>
          <div>
            <h4>해결 확정</h4>
            <p className={styles.formDescription}>관리자만 활성 EO의 최종 처리 결과를 확정할 수 있습니다.</p>
          </div>
          <label>
            <span>처리 결과<RequiredMark /></span>
            <select value={resolution.status} onChange={(event) => resolution.setStatus(event.target.value as ResolutionStatus)}>
              <option value="modified">수정 완료</option>
              <option value="not_required">수정 불필요</option>
            </select>
          </label>
          <label>
            <span>처리 사유{resolution.reasonRequired ? <RequiredMark /> : null}</span>
            <textarea
              value={resolution.reason}
              onChange={(event) => resolution.setReason(event.target.value)}
              maxLength={5000}
              rows={3}
              required={resolution.reasonRequired}
              placeholder={resolution.reasonRequired ? "수정하지 않는 사유를 직접 입력하세요." : "필요한 경우 처리 내용을 입력하세요."}
            />
          </label>
          <div className={styles.formFooter}>
            <span>{resolution.reason.length.toLocaleString()} / 5,000</span>
            <button className="button button--primary" type="submit" disabled={!resolution.canSubmit}>
              {resolution.isSubmitting ? "확정 중..." : "해결 확정"}
            </button>
          </div>
        </form>
      ) : null}

      {controller.mutationError ? (
        <p className="alert alert--error" role="alert">
          {controller.isConflict ? "다른 사용자가 먼저 내용을 변경해 최신 이력을 다시 불러왔습니다. 확인 후 다시 제출해 주세요." : errorMessage(controller.mutationError)}
        </p>
      ) : null}
    </div>
  );
}

function DiscussionEventItem({ event }: { event: DiscussionEvent }) {
  return (
    <article className={styles.event}>
      <div className={styles.eventMeta}>
        <strong>{event.actor_name}</strong>
        <span>{event.actor_role === "admin" ? "아진 관리자" : "기업 담당자"}</span>
        <span>{eventLabels[event.type]}</span>
        <time dateTime={event.created_at}>{formatDateTime(event.created_at)}</time>
      </div>
      {event.type !== "comment" ? (
        <p className={styles.transition}>{statusLabels[event.from_status]} → {statusLabels[event.to_status]}</p>
      ) : null}
      {event.body ? <p className={styles.eventBody}>{event.body}</p> : null}
    </article>
  );
}
