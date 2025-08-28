"use client"

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Judgment, Participation, Program } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

export default function ProgramJudgmentPage() {
    const { programId } = useParams();

    const [participations, setParticipations] = useState<Participation[]>([]);
    const [loading, setLoading] = useState(true);
    const [checklistData, setChecklistData] = useState<any>({})
    const [program, setProgram] = useState<Program | null>(null)

    useEffect(() => {
        if (programId) {
            fetchProgramWithParticipationAndJudgments();
        }
    }, [programId]);

    const fetchProgramWithParticipationAndJudgments = async () => {
        try {
            const response = await axios.get(`/programs/${programId}/with_participation_and_judgments`);
            setProgram(response.data.program || null);
            setParticipations(response.data.participations || null);
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
                                {participations?.map((participation: any, index: number) => {
                                    const candidateData = checklistData[participation._id] || {}
                                    const performance = candidateData.performance || 0
                                    const presentation = candidateData.presentation || 0
                                    const creativity = candidateData.creativity || 0
                                    const timeManagement = candidateData.timeManagement || 0
                                    const total = performance + presentation + creativity + timeManagement

                                    // Calculate grade based on total
                                    const getGrade = (score: number) => {
                                        if (score >= 90) return 'A+'
                                        if (score >= 80) return 'A'
                                        if (score >= 70) return 'B+'
                                        if (score >= 60) return 'B'
                                        if (score >= 50) return 'C'
                                        return 'F'
                                    }

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
                                                    max="40"
                                                    value={candidateData.performance || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                performance: parseInt(e.target.value) || 0
                                                            }
                                                        }))
                                                    }
                                                    className="w-16 h-8 text-center text-xs"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="40"
                                                    value={candidateData.performance || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                performance: parseInt(e.target.value) || 0
                                                            }
                                                        }))
                                                    }
                                                    className="w-16 h-8 text-center text-xs"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="30"
                                                    value={candidateData.presentation || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                presentation: parseInt(e.target.value) || 0
                                                            }
                                                        }))
                                                    }
                                                    className="w-16 h-8 text-center text-xs"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    value={candidateData.creativity || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                creativity: parseInt(e.target.value) || 0
                                                            }
                                                        }))
                                                    }
                                                    className="w-16 h-8 text-center text-xs"
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={candidateData.timeManagement || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                timeManagement: parseInt(e.target.value) || 0
                                                            }
                                                        }))
                                                    }
                                                    className="w-16 h-8 text-center text-xs"
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
                                                    value={candidateData.remarks || ""}
                                                    onChange={(e) =>
                                                        setChecklistData(prev => ({
                                                            ...prev,
                                                            [candidate._id]: {
                                                                ...prev[candidate._id],
                                                                remarks: e.target.value
                                                            }
                                                        }))
                                                    }
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