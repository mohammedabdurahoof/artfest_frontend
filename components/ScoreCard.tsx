import React from 'react';

interface JudgmentScore {
    candidateId: string;
    performance: number;
    presentation: number;
    creativity: number;
    timeManagement: number;
    total: number;
    grade: string;
    remarks: string;
}

interface ScoreCardProps {
    scores: JudgmentScore[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ scores }) => {
    return (
        <div className="score-card">
            <h2 className="text-lg font-bold">Score Card</h2>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Candidate ID</th>
                        <th className="border border-gray-300 px-4 py-2">Performance</th>
                        <th className="border border-gray-300 px-4 py-2">Presentation</th>
                        <th className="border border-gray-300 px-4 py-2">Creativity</th>
                        <th className="border border-gray-300 px-4 py-2">Time Management</th>
                        <th className="border border-gray-300 px-4 py-2">Total</th>
                        <th className="border border-gray-300 px-4 py-2">Grade</th>
                        <th className="border border-gray-300 px-4 py-2">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((score) => (
                        <tr key={score.candidateId}>
                            <td className="border border-gray-300 px-4 py-2">{score.candidateId}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.performance}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.presentation}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.creativity}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.timeManagement}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.total}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.grade}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.remarks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScoreCard;