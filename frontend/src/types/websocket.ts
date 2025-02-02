import { FAQ } from "./api";

export interface WebSocketMessage {
    type: 'faq' | 'status' | 'error';
    status?: 'generating' | 'complete' | 'stopped';
    question?: string;
    answer?: string;
    id?: string;
    faqId?: string;
    message?: string;
    faq?: FAQ;
}
