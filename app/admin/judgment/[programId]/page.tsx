"use client"

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { redirect, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Grade, Judgment, Participation, Position, Program } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ProgramJudgmentPage() {
    const { programId } = useParams();

    const [participations, setParticipations] = useState<Participation[]>([]);
    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState<Program | null>(null)
    const [formData, setFormData] = useState<{ participation: Participation, judgment: Judgment }[]>([]);
    const [grade, setGrade] = useState<Grade[]>([]);
    const [position, setPosition] = useState<Position[]>([]);
    const [inputError, setInputError] = useState<Record<string, string>>({});



    useEffect(() => {
        if (programId) {
            fetchProgramWithParticipationAndJudgments();
            getGradeAndPosition();
        }
    }, [programId]);

    const fetchProgramWithParticipationAndJudgments = async () => {
        try {
            const response = await axios.get(`/programs/${programId}/with_participation_and_judgments`);
            setProgram(response.data.program || null);
            setParticipations(response.data.participations || null);
            setFormData(response.data.participations || []);
        } catch (error) {
            console.error("Error fetching program with participation:", error);
            toast({
                title: "Error",
                description: "Failed to fetch program with participation",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getGradeAndPosition = async () => {
        try {
            const grade = await axios.get(`/grades/program/${programId}`);
            const position = await axios.get(`/positions/program/${programId}`);
            setGrade(grade.data.data.grades || []);
            setPosition(position.data.data.positions || []);

        } catch (error) {
            console.error("Error fetching grade and position:", error);
            toast({
                title: "Error",
                description: "Failed to fetch grade and position",
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (
        participationId: string,
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        // Check if point value is above 100
        if (name.startsWith("point") && Number(value) > 100) {
            setInputError(prev => ({
                ...prev,
                [participationId + name]: "Point cannot be above 100"
            }));
            return;
        } else {
            setInputError(prev => ({
                ...prev,
                [participationId + name]: ""
            }));
        }

        setFormData(prev =>
            prev.map(item =>
                item.participation._id === participationId
                    ? {
                        ...item,
                        judgment: {
                            ...item.judgment,
                            [name]: name.startsWith("point") ? Number(value) : value,
                        },
                    }
                    : item
            )
        );
    };
    const getMaxPossibleTotal = () => {
        let maxPoints = 0;
        const pointFields: (keyof Judgment)[] = ["point1", "point2", "point3", "point4", "point5"];
        pointFields.forEach((field, idx) => {
            const anyEntered = formData.some(item => Number(item.judgment?.[field]) > 0);
            if (anyEntered) {
                maxPoints = (idx + 1) * 100;
            }
        });
        return maxPoints;
    };



    const getGrade = (score: number) => {
        const maxPossibleTotal = getMaxPossibleTotal();
        const percentage = maxPossibleTotal > 0 ? (score / maxPossibleTotal) * 100 : 0;
        if (!Array.isArray(grade)) return null;
        const foundGrade = grade.find(g => percentage >= g.from && percentage <= g.to);
        return foundGrade ? foundGrade : null;
    };

    const getPosition = (rank: number) => {
        if (!Array.isArray(position)) return null;
        const found = position.find(p => p.rank === rank);
        return found ? found : null;
    };

    // Calculate totals and sort for ranking
    const totalsWithIndex = formData.map((item, idx) => ({
        idx,
        total:
            (Number(item.judgment?.point1) || 0) +
            (Number(item.judgment?.point2) || 0) +
            (Number(item.judgment?.point3) || 0) +
            (Number(item.judgment?.point4) || 0) +
            (Number(item.judgment?.point5) || 0)
    }));

    // Sort by total descending
    const sorted = [...totalsWithIndex].sort((a, b) => b.total - a.total);

    // Map index to position (rank)
    const indexToPosition: Record<number, number> = {};
    sorted.forEach((item, rank) => {
        // Assign same position for same total
        if (rank === 0) {
            indexToPosition[item.idx] = 1;
        } else {
            const prev = sorted[rank - 1];
            indexToPosition[item.idx] = item.total === prev.total ? indexToPosition[prev.idx] : rank + 1;
        }
    });

    const handleSubmit = async (resultStatus: string) => {
        setLoading(true);
        try {
            await Promise.all(
                formData.flatMap((item, index) => [
                    item.judgment._id
                        ? axios.patch(`/judgments/${item.judgment._id}`, { ...item.judgment, participation: item.participation._id })
                        : axios.post(`/judgments`, { ...item.judgment, participation: item.participation._id }),
                    axios.patch(`/participations/result/${item.participation._id}`, {
                        ...item.participation,
                        resultStatus,
                        position: getPosition(indexToPosition[index])?._id,
                        grade: getGrade(
                            (Number(item.judgment?.point1) || 0) +
                            (Number(item.judgment?.point2) || 0) +
                            (Number(item.judgment?.point3) || 0) +
                            (Number(item.judgment?.point4) || 0) +
                            (Number(item.judgment?.point5) || 0)
                        )?._id
                    }),
                ])
            );
            axios.patch(`/programs/${programId}`, { resultStatus })
            await fetchProgramWithParticipationAndJudgments()
            toast({
                title: "Success",
                description: "Judgments submitted successfully",
                variant: "default",
            });
        } catch (error) {
            console.error("Error submitting judgments:", error);
            toast({
                title: "Error",
                description: "Failed to submit judgments",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto">
            <div className="space-y-6">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">

                    <div className="p-4">
                        <div className="text-center text-xl font-bold">
                            {program?.programCode} - {program?.name?.toUpperCase()}
                        </div>
                        <div className="text-center">
                            {program?.category} |  {program?.isStage ? "Stage" : "Non-Stage"} | {program?.isGroup ? "Group" : "Individual"}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse judgment-table">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 p-2 text-left w-8">S.No</th>
                                    <th className="border border-gray-300 p-2 text-left w-20">Chest No</th>
                                    <th className="border border-gray-300 p-2 text-left">Candidate Name</th>
                                    <th className="border border-gray-300 p-2 text-center w-24">Point 1</th>
                                    <th className="border border-gray-300 p-2 text-center w-24">Point 2</th>
                                    <th className="border border-gray-300 p-2 text-center w-24">Point 3</th>
                                    <th className="border border-gray-300 p-2 text-center w-24">Point 4</th>
                                    <th className="border border-gray-300 p-2 text-center w-24">Point 5</th>
                                    <th className="border border-gray-300 p-2 text-center w-20">Total</th>
                                    <th className="border border-gray-300 p-2 text-center w-16">Grade</th>
                                    <th className="border border-gray-300 p-2 text-center w-16">Grade Point</th>
                                    <th className="border border-gray-300 p-2 text-center w-16">Position</th>
                                    <th className="border border-gray-300 p-2 text-center w-16">Position Point</th>
                                    <th className="border border-gray-300 p-2 text-left w-32">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData?.map((participation: any, index: number) => {
                                    const pid = participation.participation._id;
                                    const data = participation.judgment || {
                                        point1: 0, point2: 0, point3: 0, point4: 0, point5: 0,
                                        remarks: "", position: "", grade: ""
                                    };
                                    const total =
                                        (Number(data.point1) || 0) +
                                        (Number(data.point2) || 0) +
                                        (Number(data.point3) || 0) +
                                        (Number(data.point4) || 0) +
                                        (Number(data.point5) || 0);
                                    const position = indexToPosition[index]; // 1-based rank

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2 text-center font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 p-2 font-medium">
                                                {participation.participation.candidateId[0].chestNo}
                                            </td>
                                            <td className="border border-gray-300 p-2 font-mono">

                                                {participation.participation.candidateId[0].name}
                                                <br />
                                                {participation.participation.team.name} | {participation.participation.candidateId[0].class} Class | {participation.participation.candidateId[0].category}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point1"
                                                    value={data.point1 ?? 0}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className={`w-16 h-8 text-center text-xs ${inputError[pid + "point1"] ? "border-red-500 text-red-600 focus:ring-red-500" : ""
                                                        }`}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point1"]'));
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {inputError[pid + "point1"] && (
                                                    <div className="text-xs text-red-600 mt-2">{inputError[pid + "point1"]}</div>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point2"
                                                    value={data.point2}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className={`w-16 h-8 text-center text-xs ${inputError[pid + "point2"] ? "border-red-500 text-red-600 focus:ring-red-500" : ""
                                                        }`}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            // Find all inputs with name="point2"
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point2"]'));
                                                            // Find current input index
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            // Focus next input if exists
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {inputError[pid + "point2"] && (
                                                    <div className="text-xs text-red-600 mt-2">{inputError[pid + "point2"]}</div>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point3"
                                                    value={data.point3}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className="w-16 h-8 text-center text-xs"
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            // Find all inputs with name="point3"
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point3"]'));
                                                            // Find current input index
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            // Focus next input if exists
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {inputError[pid + "point3"] && (
                                                    <div className="text-xs text-red-600 mt-2">{inputError[pid + "point3"]}</div>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point4"
                                                    value={data.point4}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className="w-16 h-8 text-center text-xs"
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            // Find all inputs with name="point4"
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point4"]'));
                                                            // Find current input index
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            // Focus next input if exists
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {inputError[pid + "point4"] && (
                                                    <div className="text-xs text-red-600 mt-2">{inputError[pid + "point4"]}</div>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point5"
                                                    value={data.point5}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className="w-16 h-8 text-center text-xs"
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            // Find all inputs with name="point5"
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point5"]'));
                                                            // Find current input index
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            // Focus next input if exists
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {inputError[pid + "point5"] && (
                                                    <div className="text-xs text-red-600 mt-2">{inputError[pid + "point5"]}</div>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-16 h-8 flex items-center justify-center rounded ${total >= 80 ? 'bg-green-100 text-green-800' :
                                                    total >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        total >= 40 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {total}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${getGrade(total)?.category === "A" ? 'bg-green-200 text-green-900' :
                                                    getGrade(total)?.category === "B" ? 'bg-yellow-200 text-yellow-900' :
                                                        getGrade(total)?.category === "C" ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)?.category}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${getGrade(total)?.category === "A" ? 'bg-green-200 text-green-900' :
                                                    getGrade(total)?.category === "B" ? 'bg-yellow-200 text-yellow-900' :
                                                        getGrade(total)?.category === "C" ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)?.points}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${position === 1 ? 'bg-green-200 text-green-900' :
                                                    position === 2 ? 'bg-yellow-200 text-yellow-900' :
                                                        position === 3 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getPosition(position)?.rank || ""}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${position === 1 ? 'bg-green-200 text-green-900' :
                                                    position === 2 ? 'bg-yellow-200 text-yellow-900' :
                                                        position === 3 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getPosition(position)?.points || ""}
                                                </div>
                                            </td>

                                            <td className="border border-gray-300 p-2">
                                                <Input
                                                    placeholder="Judge remarks..."
                                                    value={data.remarks ?? ""} // ensures value is always a string
                                                    name="remarks"
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className="border-0 p-1 h-8 text-xs"
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            <div className="flex justify-between mt-10">
                <Button variant="secondary" onClick={() => redirect('/admin/judgment')}>
                    <ArrowLeft className="mr-2" />
                    Back
                </Button>
                {['pending', 'Pending', 'processing', 'completed'].includes(program?.resultStatus || '') && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => handleSubmit("processing")}
                        >
                            Save Scores
                        </Button>
                        <Button onClick={() => handleSubmit("completed")}>
                            Submit Judgment
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
