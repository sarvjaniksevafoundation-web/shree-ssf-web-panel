import { PDFViewer } from "@react-pdf/renderer";
import CertificateServerSide from "./CertificateComServerSide";

const CertificateViewer = ({ memberData, selectedProgram }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh', border: 'none' }}>
      <CertificateServerSide data={memberData} selectedProgram={selectedProgram} />
    </PDFViewer>
  );
};

export default CertificateViewer;
