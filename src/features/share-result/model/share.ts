import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

function fileName(player1: string, player2: string): string {
  const safe = (name: string) => name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `Lovers-${safe(player1)}-${safe(player2)}.pdf`;
}

function paintPage(pdf: jsPDF): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(12, 11, 15);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
}

function pdfFromSheet(dataUrl: string, width: number, height: number): Blob {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = pageWidth * 0.25;
  const imgWidth = pageWidth - marginX * 2;
  const imgHeight = (height * imgWidth) / width;
  let heightLeft = imgHeight;
  let position = 0;

  paintPage(pdf);
  pdf.addImage(dataUrl, "PNG", marginX, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 1) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    paintPage(pdf);
    pdf.addImage(dataUrl, "PNG", marginX, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  return pdf.output("blob");
}

function downloadPdf(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareResultPdf(
  node: HTMLElement,
  names: { player1: string; player2: string },
): Promise<"shared" | "downloaded" | "cancelled" | "failed"> {
  try {
    const pixelRatio = node.scrollHeight > 7000 ? 1 : 2;
    const dataUrl = await toPng(node, {
      backgroundColor: "#0c0b0f",
      pixelRatio,
      cacheBust: true,
      width: node.scrollWidth,
      height: node.scrollHeight,
    });
    const blob = pdfFromSheet(dataUrl, node.scrollWidth, node.scrollHeight);
    const file = new File([blob], fileName(names.player1, names.player2), { type: "application/pdf" });

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Lovers Compatibility" });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      }
    }

    downloadPdf(blob, file.name);
    return "downloaded";
  } catch {
    return "failed";
  }
}
