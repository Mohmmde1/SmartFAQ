"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowUpDown, Plus, Pencil } from "lucide-react"

// Mock data for FAQs
const faqs = [
    { id: 1, title: "Company Policy FAQ", questionsCount: 15, createdAt: "2023-06-01", tone: "Formal" },
    { id: 2, title: "Product Features FAQ", questionsCount: 12, createdAt: "2023-05-28", tone: "Informative" },
    { id: 3, title: "Customer Support FAQ", questionsCount: 20, createdAt: "2023-05-25", tone: "Friendly" },
    { id: 4, title: "Shipping and Returns FAQ", questionsCount: 10, createdAt: "2023-05-22", tone: "Neutral" },
    { id: 5, title: "Technical Specifications FAQ", questionsCount: 18, createdAt: "2023-05-20", tone: "Technical" },
    { id: 6, title: "Billing and Payments FAQ", questionsCount: 14, createdAt: "2023-05-18", tone: "Professional" },
    { id: 7, title: "Account Management FAQ", questionsCount: 8, createdAt: "2023-05-15", tone: "Helpful" },
    { id: 8, title: "Privacy and Security FAQ", questionsCount: 16, createdAt: "2023-05-12", tone: "Serious" },
    { id: 9, title: "Product Comparison FAQ", questionsCount: 22, createdAt: "2023-05-10", tone: "Objective" },
    { id: 10, title: "Warranty Information FAQ", questionsCount: 9, createdAt: "2023-05-08", tone: "Reassuring" },
    { id: 11, title: "Installation Guide FAQ", questionsCount: 25, createdAt: "2023-05-05", tone: "Instructive" },
    { id: 12, title: "Troubleshooting FAQ", questionsCount: 30, createdAt: "2023-05-02", tone: "Supportive" },
]

export default function FAQsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const sortedFaqs = [...faqs].sort((a, b) => {
        if (!sortColumn) return 0
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
    })

    const filteredFaqs = sortedFaqs.filter(
        (faq) =>
            faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.tone.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage)
    const paginatedFaqs = filteredFaqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">FAQs</h1>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Create New FAQ
                </Button>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="bg-card rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[300px]">
                                <Button variant="ghost" onClick={() => handleSort("title")} className="font-semibold">
                                    Title <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort("tone")} className="font-semibold">
                                    Tone <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort("questionsCount")} className="font-semibold">
                                    Questions <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort("createdAt")} className="font-semibold">
                                    Created At <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedFaqs.map((faq, index) => (
                            <TableRow key={faq.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                <TableCell className="font-medium">{faq.title}</TableCell>
                                <TableCell>{faq.tone}</TableCell>
                                <TableCell>{faq.questionsCount}</TableCell>
                                <TableCell>{faq.createdAt}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                                        <Link href={`/faq/${faq.id}/edit`}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit FAQ
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
