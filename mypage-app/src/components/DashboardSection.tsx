import React, { useEffect, useState } from "react";
import {
    getAttendanceRate,
    getInterviewCompletion,
    AttendanceRateResponse,
    InterviewCompletionResponse
} from "../api/dashboardApi.ts";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import '../assets/tailwind.css'

const COLORS = ["rgb(59,130,246)", "rgb(229,231,235)"]; // 파랑 / 회색

// 공통 도넛 데이터 생성
const makeDonutData = (percent: number) => [
    { name: "progress", value: percent },
    { name: "remain", value: 100 - percent },
];

// 공통 도넛 차트 컴포넌트
function DonutChart({
                        value,
                        label,
                        unit,
                        max = 100,
                    }: { value: number; label: string; unit: string; max?: number }) {
    const percent = Math.min(100, (value / max) * 100); // % 변환

    return (
        <div className="flex flex-col items-center justify-center p-[16px]
                        rounded-[12px] shadow border border-[rgb(229,231,235)]">
            <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={makeDonutData(percent)}
                            innerRadius={40}
                            outerRadius={55}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                        >
                            <Cell fill={COLORS[0]} />
                            <Cell fill={COLORS[1]} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* 중앙 값 */}
                <div className="absolute text-center">
                    <p className="text-[18px] font-[600] text-[rgb(17,24,39)]">
                        {value}{unit}
                    </p>
                </div>
            </div>

            {/* 라벨 */}
            <p className="text-[14px] text-[rgb(107,114,128)] mt-[12px]">{label}</p>
        </div>
    );
}

export default function DashboardSection() {
    const [attendance, setAttendance] = useState<AttendanceRateResponse | null>(null);
    const [interview, setInterview] = useState<InterviewCompletionResponse | null>(null);

    // 👉 Mock 데이터 (백 준비 전)
    const [quiz] = useState({ quizTotalCount: 42, quizMonthlyCount: 5 });
    const [review] = useState({ reviewCount: 12 });
    const [studyroom] = useState({ studyroomCount: 3 });
    const [comment] = useState({ commentCount: 27 });
    const [trust] = useState({ trustScore: 88 });

    useEffect(() => {
        const token = "test-token2";     // 👉 Mock 데이터 (백 준비 전)
        getAttendanceRate(token).then(setAttendance).catch(console.error);
        getInterviewCompletion(token).then(setInterview).catch(console.error);
    }, []);

    if (!attendance || !interview) {
        return <p>불러오는 중...</p>;
    }

    return (
        <section className="p-[24px] rounded-[12px] space-y-[20px]">
            <h2 className="text-[18px] font-[700] text-[rgb(17,24,39)]">활동 지표</h2>

            {/* 텍스트 로그 */}
            <div className="grid grid-cols-2 gap-[12px] mb-[24px]">
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">출석률</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{attendance.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">출석일수</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{attendance.attended}/{attendance.totalDays}일</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">총 모의면접</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{interview.interviewTotalCount}회</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">이번 달 모의면접</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{interview.interviewMonthlyCount}회</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">총 문제풀이</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{quiz.quizTotalCount}개</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">이번 달 문제풀이</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{quiz.quizMonthlyCount}개</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">리뷰 작성</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{review.reviewCount}개</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">모임 작성</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{studyroom.studyroomCount}개</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">댓글 작성</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{comment.commentCount}개</span>
                </div>
                <div className="flex justify-between items-center p-[12px] bg-[rgb(249,250,251)] rounded-[8px]">
                    <span className="text-[13px] text-[rgb(107,114,128)]">신뢰 점수</span>
                    <span className="font-[600] text-[rgb(37,99,235)]">{trust.trustScore}점</span>
                </div>
            </div>

            {/* 도넛 차트 레이아웃 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
                <DonutChart value={attendance.attendanceRate} label="출석률" unit="%" max={100} />
                <DonutChart value={interview.interviewMonthlyCount} label="이번 달 모의면접" unit="회" max={10} />
                <DonutChart value={quiz.quizMonthlyCount} label="이번 달 문제풀이" unit="개" max={20} />
                <DonutChart value={trust.trustScore} label="신뢰 점수" unit="점" max={100} />
            </div>
        </section>
    );
}
