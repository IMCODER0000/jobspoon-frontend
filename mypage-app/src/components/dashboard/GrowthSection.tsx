import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import styled from "styled-components";
import {
    TrustScoreHistoryResponse,
} from "../../api/userTrustScoreApi.ts";

export default function GrowthSection({ history, currentScore }: {
    history: TrustScoreHistoryResponse[];
    currentScore: number;
}) {
    if (!history || history.length === 0) {
        return <Message>활동 점수 이력이 없습니다.</Message>;
    }

    const sortedData = [...history].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    const chartData = [
        ...sortedData,
        { score: currentScore, recordedAt: new Date().toISOString() },
    ];

    const yDomain = [0, 100];

    return (
        <ChartWrapper>
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis
                        dataKey="recordedAt"
                        tickFormatter={(t) =>
                            new Date(t).toLocaleDateString("ko-KR", { month: "short" })
                        }
                        interval="preserveStartEnd"
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={yDomain}
                        tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            fontSize: "13px",
                        }}
                        labelFormatter={(t) => {
                            const date = new Date(t);
                            const now = new Date();
                            const isThisMonth =
                                date.getFullYear() === now.getFullYear() &&
                                date.getMonth() === now.getMonth();

                            // 과거달은 "9월", 이번달은 "10월 30일"
                            if (isThisMonth) {
                                return `${date.getMonth() + 1}월 ${date.getDate()}일`;
                            } else {
                                return `${date.getMonth() + 1}월`;
                            }
                        }}
                        formatter={(v: any) => [`${v.toFixed(1)}점`, "활동 점수"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        fill="url(#colorTrust)"
                        strokeWidth={2.3}
                        dot={{
                            r: 3,
                            fill: "#fff",
                            stroke: "#3B82F6",
                            strokeWidth: 2,
                        }}
                        activeDot={{
                            r: 5,
                            strokeWidth: 1,
                            stroke: "#2563EB",
                            fill: "#fff",
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}


/* ================= styled-components ================= */

const ChartWrapper = styled.div`
    width: 100%;
    height: 240px;
`;

const Message = styled.p`
    font-size: 0.95rem;
    color: #888;
    text-align: center;
`;
