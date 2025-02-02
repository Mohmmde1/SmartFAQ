import { AppError } from "@/lib/errors";

export const pdfService = {
    async upload(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-pdf', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            );
        }

        return result;
    }
};
