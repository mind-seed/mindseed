import z from "zod";

export const ReportReasonSchema = z.string().min(1).max(500);