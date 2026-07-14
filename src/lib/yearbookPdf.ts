import { jsPDF } from 'jspdf';
import { EMOTIONS } from '../tokens';
import type { Memory } from '../types';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function imageFormat(dataUrl: string): 'JPEG' | 'PNG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

export async function generateYearbookPdf(
  memories: Memory[],
  year: number,
  childName: string,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const yearMemories = [...memories].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const milestoneCount = yearMemories.filter((m) => m.milestone).length;
  const emotionCounts = new Map<string, number>();
  for (const m of yearMemories) emotionCounts.set(m.emotion, (emotionCounts.get(m.emotion) ?? 0) + 1);
  const topEmotion = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Cover page
  doc.setFillColor('#faf8f7');
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  doc.setTextColor('#3a3245');
  doc.setFont('times', 'italic');
  doc.setFontSize(42);
  doc.text(String(year), PAGE_W / 2, 110, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#6b6180');
  doc.text(`${childName ? `${childName}'s` : "Our"} year in memories`, PAGE_W / 2, 124, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor('#9b93ae');
  const stats = [
    `${yearMemories.length} ${yearMemories.length === 1 ? 'memory' : 'memories'} captured`,
    milestoneCount > 0 ? `${milestoneCount} ${milestoneCount === 1 ? 'milestone' : 'milestones'} reached` : '',
    topEmotion ? `Most felt: ${EMOTIONS[topEmotion as keyof typeof EMOTIONS]?.label ?? topEmotion}` : '',
  ].filter(Boolean);
  stats.forEach((line, i) => doc.text(line, PAGE_W / 2, 150 + i * 8, { align: 'center' }));

  doc.setFontSize(10);
  doc.setTextColor('#c5bfd4');
  doc.text('Captured with Our World', PAGE_W / 2, PAGE_H - 20, { align: 'center' });

  // Memory pages
  let y = MARGIN;
  doc.addPage();
  doc.setFillColor('#faf8f7');
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      doc.setFillColor('#faf8f7');
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
      y = MARGIN;
    }
  };

  for (const m of yearMemories) {
    let imageData: string | null = null;
    const imgSrc = m.media === 'video' ? m.posterUri : (m.media !== 'text' && m.media !== 'voice' ? m.mediaUri : undefined);
    if (imgSrc) imageData = await loadImageAsDataUrl(imgSrc);

    ensureSpace(imageData ? 70 : 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#9b93ae');
    doc.text((m.dateShort ?? m.date).toUpperCase(), MARGIN, y);
    if (m.milestone) {
      doc.setTextColor('#d4a847');
      doc.text('★ MILESTONE', PAGE_W - MARGIN, y, { align: 'right' });
    }
    y += 7;

    if (imageData) {
      try {
        const imgW = 50;
        const imgH = 50;
        doc.addImage(imageData, imageFormat(imageData), MARGIN, y, imgW, imgH, undefined, 'FAST');
        doc.setFont('times', 'italic');
        doc.setFontSize(14);
        doc.setTextColor('#3a3245');
        const titleLines = doc.splitTextToSize(m.milestoneLabel || m.title, CONTENT_W - imgW - 6);
        doc.text(titleLines, MARGIN + imgW + 6, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#6b6180');
        const noteLines = doc.splitTextToSize(m.note || '', CONTENT_W - imgW - 6);
        doc.text(noteLines.slice(0, 5), MARGIN + imgW + 6, y + 6 + titleLines.length * 6 + 4);
        y += imgH + 12;
      } catch {
        y += 4;
      }
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.setTextColor('#3a3245');
      const titleLines = doc.splitTextToSize(m.milestoneLabel || m.title, CONTENT_W);
      doc.text(titleLines, MARGIN, y + 6);
      y += 6 + titleLines.length * 6 + 2;

      if (m.note) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#6b6180');
        const noteLines = doc.splitTextToSize(m.note, CONTENT_W);
        ensureSpace(noteLines.length * 5 + 6);
        doc.text(noteLines, MARGIN, y);
        y += noteLines.length * 5 + 6;
      } else {
        y += 6;
      }
    }

    doc.setDrawColor('#ebe8f0');
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 10;
  }

  const filename = `${(childName || 'our-world').replace(/\s+/g, '-').toLowerCase()}-${year}-keepsake.pdf`;
  doc.save(filename);
}
