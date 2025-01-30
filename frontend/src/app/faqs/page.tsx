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
import { useFAQs } from "@/hooks/useFAQs"
import { TableSkeleton } from "@/components/table-skeleton"

export default function FAQsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const { faqs: faqData, isLoading, error } = useFAQs({
        page: currentPage,
    })

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
        setCurrentPage(1)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">FAQs</h1>
                <Link href="/faq/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Create New FAQ
                    </Button>
                </Link>
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <TableSkeleton />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : faqData?.results.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No FAQs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            faqData?.results.map((faq, index) => (
                                <TableRow key={faq.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <TableCell className="font-medium">{faq.title}</TableCell>
                                    <TableCell>{faq.tone}</TableCell>
                                    <TableCell>{faq.generated_faqs.length}</TableCell>
                                    <TableCell>{new Date(faq.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/faq/${faq.id}`}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit FAQ
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
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
                            Page {currentPage} of {Math.ceil((faqData?.count || 0) / itemsPerPage)}
                        </span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={() => setCurrentPage((prev) =>
                                Math.min(prev + 1, Math.ceil((faqData?.count || 0) / itemsPerPage))
                            )}
                            className={
                                currentPage === Math.ceil((faqData?.count || 0) / itemsPerPage)
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
