"use client"

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Grade, Judgment, Participation, Position, Program } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { se } from "date-fns/locale";

export default function ProgramJudgmentPage() {
    const { programId } = useParams();

    const [participations, setParticipations] = useState<Participation[]>([]);
    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState<Program | null>(null)
    const [formData, setFormData] = useState<{ participation: Participation, judgment: Judgment }[]>([]);
    const [grade, setGrade] = useState<Grade[]>([]);
    const [position, setPosition] = useState<Position[]>([]);

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
            setGrade(grade.data || []);
            setPosition(position.data || []);
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
                                        remark: "", position: "", grade: ""
                                    };
                                    const total =
                                        (Number(data.point1) || 0) +
                                        (Number(data.point2) || 0) +
                                        (Number(data.point3) || 0) +
                                        (Number(data.point4) || 0) +
                                        (Number(data.point5) || 0);

                                    const getGrade = (score: number) => {
                                        if (score >= 90) return 'A+'
                                        if (score >= 80) return 'A'
                                        if (score >= 70) return 'B+'
                                        if (score >= 60) return 'B'
                                        if (score >= 50) return 'C'
                                        return 'F'
                                    };

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
                                                    className="w-16 h-8 text-center text-xs"
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            // Find all inputs with name="point1"
                                                            const inputs = Array.from(document.querySelectorAll('input[name="point1"]'));
                                                            // Find current input index
                                                            const idx = inputs.indexOf(e.target as HTMLInputElement);
                                                            // Focus next input if exists
                                                            if (idx !== -1 && idx < inputs.length - 1) {
                                                                (inputs[idx + 1] as HTMLInputElement).focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    name="point2"
                                                    value={data.point2}
                                                    onChange={e => handleInputChange(pid, e)}
                                                    className="w-16 h-8 text-center text-xs"
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
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${total >= 80 ? 'bg-green-200 text-green-900' :
                                                    total >= 60 ? 'bg-yellow-200 text-yellow-900' :
                                                        total >= 40 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${total >= 80 ? 'bg-green-200 text-green-900' :
                                                    total >= 60 ? 'bg-yellow-200 text-yellow-900' :
                                                        total >= 40 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${total >= 80 ? 'bg-green-200 text-green-900' :
                                                    total >= 60 ? 'bg-yellow-200 text-yellow-900' :
                                                        total >= 40 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-bold">
                                                <div className={`w-12 h-8 flex items-center justify-center rounded font-bold ${total >= 80 ? 'bg-green-200 text-green-900' :
                                                    total >= 60 ? 'bg-yellow-200 text-yellow-900' :
                                                        total >= 40 ? 'bg-orange-200 text-orange-900' :
                                                            'bg-red-200 text-red-900'
                                                    }`}>
                                                    {getGrade(total)}
                                                </div>
                                            </td>

                                            <td className="border border-gray-300 p-2">
                                                <Input
                                                    placeholder="Judge remarks..."
                                                    value={data.remark ?? ""} // ensures value is always a string
                                                    name="remark"
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


            <div className="flex justify-between mt-10 float-end">
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            // Save judgment data
                            // try {
                            //     await axios.post(`/participations/${selectedParticipationForChecklist._id}/judgment`, {
                            //         judgmentData: checklistData,
                            //         judgeId: user?.id,
                            //         submittedAt: new Date().toISOString()
                            //     })
                            //     toast({
                            //         title: "Success",
                            //         description: "Judgment data saved successfully",
                            //     })
                            // } catch (error) {
                            //     toast({
                            //         title: "Error",
                            //         description: "Failed to save judgment data",
                            //         variant: "destructive",
                            //     })
                            // }
                        }}
                    >
                        Save Scores
                    </Button>
                    <Button onClick={async () => {
                        // Submit final judgment
                        // try {
                        //     await axios.post(`/participations/${selectedParticipationForChecklist._id}/judgment/submit`, {
                        //         judgmentData: checklistData,
                        //         judgeId: user?.id,
                        //         finalSubmission: true,
                        //         submittedAt: new Date().toISOString()
                        //     })
                        //     toast({
                        //         title: "Success",
                        //         description: "Judgment submitted successfully",
                        //     })
                        //     setIsChecklistDialogOpen(false)
                        // } catch (error) {
                        //     toast({
                        //         title: "Error",
                        //         description: "Failed to submit judgment",
                        //         variant: "destructive",
                        //     })
                        // }
                    }}>
                        Submit Judgment
                    </Button>
                </div>
            </div>
        </div>
    );
}