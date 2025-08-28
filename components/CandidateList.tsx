import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
// import { Candidate } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CandidateListProps {
    programId: string;
}

const CandidateList: React.FC<CandidateListProps> = ({ programId }) => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // const response = await axios.get(`/programs/${programId}/candidates`);
                setCandidates([
                    {
                        _id: "1",
                        name: "John Doe",
                        chestNo: "C001",
                        class: ["Class A", "Class B"],
                    },
                    {
                        _id: "2",
                        name: "Jane Smith",
                        chestNo: "C002",
                        class: ["Class A"],
                    },
                ]);
            } catch (error) {
                console.error("Error fetching candidates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [programId]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading candidates...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Candidates</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Chest No</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                                No candidates found
                            </TableCell>
                        </TableRow>
                    ) : (
                        candidates.map((candidate) => (
                            <TableRow key={candidate._id}>
                                <TableCell>{candidate.name}</TableCell>
                                <TableCell>{candidate.chestNo}</TableCell>
                                <TableCell>{candidate.class.join(", ")}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">Active</Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CandidateList;