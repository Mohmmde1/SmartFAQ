import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Loader2 } from "lucide-react"
import { QuestionAnswer } from "@/types/api"

interface GeneratedFAQsProps {
    faqs: QuestionAnswer[]
    isLoading?: boolean
}

export function GeneratedFAQs({ faqs, isLoading }: GeneratedFAQsProps) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Generated FAQs
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px]">
                    <div className="space-y-4 p-4">
                        {faqs.length === 0 && !isLoading ? (
                            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                No FAQs generated yet
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {faqs.map((qa, index) => (
                                    <motion.div
                                        key={qa.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.2
                                        }}
                                        className="border border-border/50 p-6 rounded-lg
                                                 hover:bg-accent/50 transition-colors
                                                 shadow-sm hover:shadow-md"
                                    >
                                        <motion.h3
                                            className="font-semibold mb-3 text-l"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 + index * 0.2 }}
                                        >
                                            {qa.question}
                                        </motion.h3>
                                        <motion.p
                                            className="text-muted-foreground leading-relaxed"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 + index * 0.2 }}
                                        >
                                            {qa.answer}
                                        </motion.p>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border border-border/50 p-6 rounded-lg"
                                    >
                                        <div className="flex gap-2 items-center text-muted-foreground">
                                            <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                                            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
