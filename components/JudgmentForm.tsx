import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface JudgmentScore {
    performance: number;
    presentation: number;
    creativity: number;
    timeManagement: number;
}

interface JudgmentFormProps {
    onSubmit: (scores: JudgmentScore[], remarks: string) => void;
    initialScores?: JudgmentScore[];
    initialRemarks?: string;
}

const JudgmentForm: React.FC<JudgmentFormProps> = ({ onSubmit, initialScores = [], initialRemarks = "" }) => {
    const [scores, setScores] = useState<JudgmentScore[]>(initialScores);
    const [remarks, setRemarks] = useState(initialRemarks);

    const handleScoreChange = (index: number, field: keyof JudgmentScore, value: number) => {
        const updatedScores = [...scores];
        updatedScores[index] = { ...updatedScores[index], [field]: value };
        setScores(updatedScores);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(scores, remarks);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {scores.map((score, index) => (
                <div key={index} className="flex flex-col">
                    <Label>Candidate {index + 1}</Label>
                    <Input
                        type="number"
                        placeholder="Performance"
                        value={score.performance}
                        onChange={(e) => handleScoreChange(index, "performance", Number(e.target.value))}
                    />
                    <Input
                        type="number"
                        placeholder="Presentation"
                        value={score.presentation}
                        onChange={(e) => handleScoreChange(index, "presentation", Number(e.target.value))}
                    />
                    <Input
                        type="number"
                        placeholder="Creativity"
                        value={score.creativity}
                        onChange={(e) => handleScoreChange(index, "creativity", Number(e.target.value))}
                    />
                    <Input
                        type="number"
                        placeholder="Time Management"
                        value={score.timeManagement}
                        onChange={(e) => handleScoreChange(index, "timeManagement", Number(e.target.value))}
                    />
                </div>
            ))}
            <Label>Remarks</Label>
            <Input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
            />
            <Button type="submit">Submit Judgment</Button>
        </form>
    );
};

export default JudgmentForm;