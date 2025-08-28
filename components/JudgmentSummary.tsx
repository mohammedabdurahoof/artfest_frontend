import React from 'react';
import { Judgment } from '@/types';

interface JudgmentSummaryProps {
    judgments: Judgment[];
}

const JudgmentSummary: React.FC<JudgmentSummaryProps> = ({ judgments }) => {
    const totalJudgments = judgments.length;
    const finalizedJudgments = judgments.length //.filter(j => j.status === 'finalized').length;
    const submittedJudgments = judgments.length //.filter(j => j.status === 'submitted').length;

    return (
        <div className="judgment-summary">
            <h2 className="text-xl font-bold">Judgment Summary</h2>
            <div className="summary-stats">
                <div>
                    <strong>Total Judgments:</strong> {totalJudgments}
                </div>
                <div>
                    <strong>Finalized Judgments:</strong> {finalizedJudgments}
                </div>
                <div>
                    <strong>Submitted Judgments:</strong> {submittedJudgments}
                </div>
            </div>
        </div>
    );
};

export default JudgmentSummary;