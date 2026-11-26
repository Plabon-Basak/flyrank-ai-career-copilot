import { handleAnalyzeRequest } from "../../../lib/ai/handler.ts";

export async function POST(request: Request) {
  return handleAnalyzeRequest(request, async (input) => {
    const { analyzeCareer } = await import("../../../lib/ai/provider.ts");
    return analyzeCareer(input);
  });
}
