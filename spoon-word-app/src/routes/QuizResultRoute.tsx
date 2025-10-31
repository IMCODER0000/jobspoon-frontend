import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizResultPage from "../pages/QuizResultPage";
import { getSessionReport, getSessionSummary } from "../api/quiz";
import { retryWrongOnly } from "../api/quizChoice";

type OX = "O" | "X";
const QUIZ_LEN = 3;
const LS_KEY_LAST_SESSION = "quiz:lastSessionId";
const LS_KEY_PROGRESS = "quiz/initials-or-ox/progress";

type ResultState = {
    progress?: (OX | null)[];
    sessionId?: number | string;
};

export default function QuizResultRoute() {
    const nav = useNavigate();
    const location = useLocation();
    const { state } = location as { state?: ResultState };

    const stored = React.useMemo<(OX | null)[] | null>(() => {
        try {
            const raw = localStorage.getItem(LS_KEY_PROGRESS);
            return raw ? (JSON.parse(raw) as (OX | null)[]) : null;
        } catch {
            return null;
        }
    }, []);

    const sessionId = React.useMemo(() => {
        const fromState = state?.sessionId;
        const fromQs = new URLSearchParams(location.search).get("sessionId");
        const fromLs = localStorage.getItem(LS_KEY_LAST_SESSION);
        const cand = [fromState, fromQs, fromLs].find((v) => v != null && String(v).trim() !== "");
        const n = Number(cand);
        return Number.isFinite(n) ? n : undefined;
    }, [state?.sessionId, location.search]);

    const [serverProgress, setServerProgress] = React.useState<OX[] | null>(null);

    React.useEffect(() => {
        let aborted = false;
        (async () => {
            if (!sessionId) return;
            try {
                const sum = await getSessionSummary(sessionId);
                const st = String(sum?.status || sum?.sessionStatus || "").toUpperCase();
                if (aborted || st !== "SUBMITTED") return;

                const rep = await getSessionReport(sessionId);
                if (aborted || !rep?.details) return;
                const arr: OX[] = rep.details.map((d: any) => (d?.correct ? "O" : "X"));
                setServerProgress(arr);
            } catch {
            }
        })();
        return () => { aborted = true; };
    }, [sessionId]);

    const progress: (OX | null)[] =
        serverProgress ?? state?.progress ?? stored ?? Array.from({ length: QUIZ_LEN }, () => null);

    const handleRetryWrong = async () => {
        if (!sessionId) return;
        try {
            const res = await retryWrongOnly(sessionId);
            const newSid = Number(res?.newSessionId);
            if (!Number.isFinite(newSid)) throw new Error("Invalid newSessionId");
            try { localStorage.setItem(LS_KEY_LAST_SESSION, String(newSid)); } catch {}

            let qt = String(res?.questionType || "").toUpperCase();
            if (!qt) {
                try {
                    const sum = await getSessionSummary(newSid);
                    qt = String(sum?.questionType || sum?.question_type || "").toUpperCase();
                } catch {}
            }

            const playPath = (res?.playPath || "").trim();
            const route = playPath || resolveRouteForQuestionType(qt);
            nav(`${route}?sessionId=${newSid}`, { replace: true });
        } catch (e) {
            console.error("[retryWrongOnly] failed", e);
            alert("오답만 다시 풀기를 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
        }
    };

    function resolveRouteForQuestionType(qt: string): string {
        const Q = qt.toUpperCase();
        if (Q.includes("OX") || Q.includes("TRUE_FALSE") || Q === "TF" || Q === "BOOLEAN")
            return "/spoon-word/quiz/ox";
        if (Q.includes("INITIAL")) return "/spoon-word/quiz/initials";
        return "/spoon-word/quiz/choice";
    }

    return (
        <QuizResultPage
            progress={progress}
            sessionId={sessionId}
            title="결과 보기"
            onRetryWrong={handleRetryWrong}
            onClose={() => nav("/spoon-word/quiz", { replace: true })}
            onFinish={() => nav("/spoon-word/quiz", { replace: true })}
        />
    );
}
