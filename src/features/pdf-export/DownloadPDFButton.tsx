import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { ResumePDFDocument } from './ResumePDFDocument';
import { Button } from '@/shared/ui/Button';

export function DownloadPDFButton() {
  const activeBranchId = useResumeStore((state) => state.activeBranchId);
  const activeBranch = useResumeStore((state) => state.branches[activeBranchId]);

  if (!activeBranch) return null;

  // Sanitize the file title for a safe file name, ensuring it ends with .pdf
  const rawTitle = activeBranch.data.metadata.fileTitle || 'resume';
  const sanitizedTitle = rawTitle.trim().replace(/[/\\?%*:|"<>\s]/g, '_');
  const fileName = `${sanitizedTitle || 'resume'}.pdf`;

  return (
    <PDFDownloadLink
      document={<ResumePDFDocument data={activeBranch.data} />}
      fileName={fileName}
      style={{ textDecoration: 'none', display: 'block', width: '100%' }}
    >
      {({ loading }) => (
        <Button
          variant="primary"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Генерация PDF...' : 'Скачать PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
export default DownloadPDFButton;
