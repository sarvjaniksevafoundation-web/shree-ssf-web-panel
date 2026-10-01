import React from 'react';
import {
  Document,
  Page,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { TrsutData } from '@/lib/constentData';
import { AutoText, FONT_GU } from '@/components/pdfcom/AutoFontText';

/**
 * Membership certificate (Gujarati).
 *
 * All fixed labels are Gujarati. Dynamic data is rendered through <AutoText>,
 * which detects the script of each string and applies the matching font - so a
 * member name, program name or note line that is still stored in Hindi
 * (Devanagari) prints correctly with NotoSansDevanagari instead of coming out
 * as blank boxes, while Gujarati text uses NotoSansGujarati.
 */


const LABELS = {
  memberPhoto: 'સભ્ય ફોટો',
  regNo: 'સભ્યપદ ક્રમાંક:',
  date: 'તારીખ:',
  name: 'નામ:',
  fatherName: 'પિતા/પતિનું નામ:',
  gotra: 'ગોત્ર:',
  jati: 'જ્ઞાતિ:',
  dob: 'જન્મ તા.:',
  phone: 'મોબાઈલ નંબર:',
  village: 'ગામ/શહેરનું નામ:',
  district: 'જિલ્લો:',
  state: 'રાજ્ય:',
  guardian: 'વારસદાર:',
  joinFees: 'સભ્યપદ ફી:',
  contribution: (event) => `દરેક ${event} પર સહયોગ રકમ:`,
  events: { suraksha: 'દેહાંત', mamera: 'મામેરું', vivah: 'લગ્ન' },
  karyakarta: 'કાર્યકર્તા',
  founder: 'સંસ્થાપક',
};

// Trust name printed above "સંસ્થાપક". Falls back to the Hindi name if the
// Gujarati one has not been added to TrsutData yet.
const TRUST_NAME = TrsutData.guName || TrsutData.name;

// Program title: Gujarati name first, then Hindi, then the english name, so the
// certificate is never blank for an older program.
const getProgramName = (selectedProgram) => {
  if (!selectedProgram) return '';
  return selectedProgram.guname || selectedProgram.hiname || selectedProgram.name || '';
};

const getEventWord = (selectedProgram) => {
  if (selectedProgram?.isSuraksha) return LABELS.events.suraksha;
  if (selectedProgram?.isMamera) return LABELS.events.mamera;
  return LABELS.events.vivah;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    width: '210mm',
    height: '148mm',
    position: 'relative',
  },
  outerBorder: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  innerBorder: {
    padding: 28,
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  topText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  smallText: {
    fontSize: 10,
    color: '#8B0000',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 4,
  },
  logoImage1: {
    width: 78,
    height: 68,
    borderRadius: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 26,
    color: '#8B0000',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  address: {
    fontSize: 9,
    color: '#333',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 1.3,
    paddingHorizontal: 10,
  },
  phoneNumbers: {
    fontSize: 9,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  schemeBox: {
    backgroundColor: '#1a0f5e',
    borderRadius: 14,
    paddingVertical: 3,
    paddingHorizontal: 14,
    alignSelf: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  schemeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  formSection: {
    marginTop: 0,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 9.5,
    color: '#000',
    marginRight: 4,
    fontWeight: 'normal',
  },
  value: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
    borderBottom: '1px dotted #000',
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 16,
    textTransform: 'capitalize'
  },
  memberIdBox: {
    position: 'absolute',
    right: 40,
    top: 160,
    border: '2px solid #333',
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 3,
    overflow: 'hidden',
  },
  memberIdText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginTop: 2,
  },
  memberIdLabel: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    paddingTop: 10,
  },
  detailsSection: {
    marginTop: 6,
    fontSize: 8.5,
    color: '#000',
    textAlign: 'justify',
    lineHeight: 1.4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  leftFooter: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
  },
  rightFooter: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
    position: 'relative',
  },
  stampImage: {
    position: 'absolute',
    right: 22,
    bottom: -6,
    width: 66,
    height: 60,
    objectFit: 'contain',
  },
  footerLabel: {
    fontSize: 9,
    color: '#000',
    marginTop: 5,
    fontWeight: 'bold',
  },
  footerValue: {
    fontSize: 9.5,
    color: '#000',
    fontWeight: 'bold',
    borderBottom: '1px dotted #000',
    paddingBottom: 8,
    paddingTop: 1,
    minWidth: 140,
    textAlign: 'center',
    marginTop: 2,
  },
  signatureText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
    borderTop: '1px solid #000',
    paddingTop: 3,
    minWidth: 140,
  },
  serialNumber: {
    position: 'absolute',
    top: -10,
    right: 24,
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  fieldGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  watermark: {
    position: 'absolute',
    top: '28mm',
    left: '42mm',
    width: '115mm',
    height: '85mm',
    opacity: 0.08,
    zIndex: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  donationHighlight: {
    backgroundColor: '#fff3cd',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  remarkBox: {
    position: 'absolute',
    bottom: 115,
    right: 13,
  }
});

const Certificate = ({ data, selectedProgram }) => {
  const programName = getProgramName(selectedProgram);
  const eventWord = getEventWord(selectedProgram);

  return (
    <Page size={{ width: '210mm', height: '148mm' }} style={[styles.page, { fontFamily: FONT_GU }]}>
      <View style={styles.outerBorder}>
        <Image src={TrsutData.frameImg} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '210mm',
          height: '148mm',
          zIndex: -1,
        }} />

        <View style={styles.innerBorder}>
          {/* Watermark */}
          <Image
            src={TrsutData.logo}
            style={styles.watermark}
          />

          <View style={{
            height: 130,
            width: '100%',
          }} />

          {/* Member photo box */}
          <View style={styles.memberIdBox}>
            {data?.photoURL ? (
              <Image src={data.photoURL} style={styles.photoImage} />
            ) : (
              <View>
                <AutoText style={styles.memberIdLabel}>
                  {LABELS.memberPhoto}
                </AutoText>
              </View>
            )}
          </View>

          {/* Program / scheme name */}
          <View style={styles.schemeBox}>
            <AutoText style={styles.schemeText}>
              {programName}
            </AutoText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Row 1 */}
            <View style={[styles.row, {
              justifyContent: 'space-between',
              marginRight: 55
            }]}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.regNo}</AutoText>
                <AutoText style={[styles.value, { minWidth: 90 }]}>
                  {data?.registrationNumber || '---'}
                </AutoText>
              </View>
              <View style={[styles.fieldGroup, { marginLeft: 20, marginRight: 40 }]}>
                <AutoText style={styles.label}>{LABELS.date}</AutoText>
                <AutoText style={[styles.value, { minWidth: 60 }]}>
                  {data?.dateJoin || '---'}
                </AutoText>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.name}</AutoText>
                <AutoText style={[styles.value, { minWidth: 150 }]}>
                  {data?.displayName + " " || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.fatherName}</AutoText>
                <AutoText style={[styles.value, { minWidth: 150 }]}>
                  {data?.fatherName + " " || '---'}
                </AutoText>
              </View>
            </View>

            {/* Row 3 */}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.gotra}</AutoText>
                <AutoText style={[styles.value, { minWidth: 90 }]}>
                  {data?.gotra + " " || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.jati}</AutoText>
                <AutoText style={[styles.value, { minWidth: 100 }]}>
                  {data?.jati + " " || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.dob}</AutoText>
                <AutoText style={[styles.value, { minWidth: 110 }]}>
                  {data?.bobDate || '---'}
                </AutoText>
              </View>
            </View>

            {/* Row 4 */}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.phone}</AutoText>
                <AutoText style={[styles.value, { minWidth: 140 }]}>
                  {data?.phone || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.village}</AutoText>
                <AutoText style={[styles.value, { minWidth: 135 }]}>
                  {data?.village + " " || '---'}
                </AutoText>
              </View>
            </View>

            {/* Row 5 */}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.district}</AutoText>
                <AutoText style={[styles.value, { minWidth: 160 }]}>
                  {data?.district + " " || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.state}</AutoText>
                <AutoText style={[styles.value, { minWidth: 180 }]}>
                  {data?.state + " " || '---'}
                </AutoText>
              </View>
            </View>

            {/* Row 6 */}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>{LABELS.guardian}</AutoText>
                <AutoText style={[styles.value, { minWidth: 160 }]}>
                  {data?.guardian + " " || '---'}
                </AutoText>
              </View>
              <View style={styles.fieldGroup}>
                <AutoText style={styles.label}>
                  {LABELS.contribution(eventWord)}
                </AutoText>
                <AutoText style={[styles.value, { minWidth: 70 }]}>
                  {`₹ ${data?.payAmount || '0'}/-`}
                </AutoText>
              </View>
            </View>
          </View>

          {/* Details / note line */}
          {selectedProgram?.noteLine && (
            <View style={styles.detailsSection}>
              <AutoText>
                {selectedProgram?.noteLine}
              </AutoText>
            </View>
          )}

          {/* Footer Section */}
          <View style={styles.footerSection}>
            {/* Left Side - Karyakarta */}
            <View style={styles.leftFooter}>
              <AutoText style={styles.footerValue}>
                {`${data?.addedByName || '---'}${data?.agentPhone ? ` (${data.agentPhone})` : ''}`}
              </AutoText>
              <AutoText style={styles.footerLabel}>
                {`${LABELS.karyakarta}${data?.agentCode ? ` (${data.agentCode})` : ''}`}
              </AutoText>
            </View>

            {/* Right Side - Signature */}
            <View style={styles.rightFooter}>
              {TrsutData.stampImg && (
                <Image src={TrsutData.stampImg} style={styles.stampImage} />
              )}
              <AutoText style={styles.footerValue}>
                {TRUST_NAME}
              </AutoText>
              <AutoText style={styles.footerLabel}>
                {LABELS.founder}
              </AutoText>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

const CertificateComServerSide = ({ data, selectedProgram }) => {
  const membersArray = Array.isArray(data) ? data : [data];

  return (
    <Document>
      {membersArray.map((member, index) => (
        <Certificate
          key={member?.id || member?.registrationNumber || index}
          data={member}
          selectedProgram={selectedProgram}
          index={index}
        />
      ))}
    </Document>
  );
};

export default CertificateComServerSide;
