import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/entities/resume/types';
import { markdownParser } from '@/shared/lib/markdownParser';

// Strict ATS-friendly styles (Single column, standard Helvetica fonts, no color backgrounds/icons)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1A1A1A',
  },
  headerContainer: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  fullName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    marginBottom: 3,
    color: '#000000',
  },
  jobTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
  },
  contactInfo: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#4B5563',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#000000',
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9.5,
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    marginBottom: 2,
  },
  companyPosition: {
    fontFamily: 'Helvetica-Bold',
  },
  dates: {
    fontFamily: 'Helvetica',
    color: '#4B5563',
  },
  experienceDescription: {
    fontSize: 9,
    lineHeight: 1.35,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillsText: {
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  },
});

interface MarkdownTextProps {
  content: string;
  style?: any;
}

export function MarkdownText({ content, style }: MarkdownTextProps) {
  const tokens = markdownParser(content);

  return (
    <Text style={style}>
      {tokens.map((token, index) => {
        if (token.type === 'bold') {
          return (
            <Text key={index} style={styles.bold}>
              {token.value}
            </Text>
          );
        }
        if (token.type === 'italic') {
          return (
            <Text key={index} style={styles.italic}>
              {token.value}
            </Text>
          );
        }
        return token.value;
      })}
    </Text>
  );
}

interface ResumePDFDocumentProps {
  data: ResumeData;
}

export function ResumePDFDocument({ data }: ResumePDFDocumentProps) {
  const visibleExperience = data.experience.filter((item) => item.isVisible);

  const contactItems = [
    data.header.email,
    data.header.phone,
    data.header.telegram ? `Telegram: ${data.header.telegram}` : null,
    data.header.github ? `GitHub: ${data.header.github}` : null,
    data.header.website ? `Web: ${data.header.website}` : null,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {data.header.fullName ? (
            <Text style={styles.fullName}>{data.header.fullName}</Text>
          ) : null}
          {data.header.title ? (
            <Text style={styles.jobTitle}>{data.header.title}</Text>
          ) : null}
          {contactItems.length > 0 ? (
            <Text style={styles.contactInfo}>{contactItems.join('  |  ')}</Text>
          ) : null}
        </View>

        {/* Summary Section */}
        {data.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <MarkdownText content={data.summary} style={styles.summaryText} />
          </View>
        ) : null}

        {/* Experience Section */}
        {visibleExperience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {visibleExperience.map((item) => (
              <View key={item.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyPosition}>
                    {item.company}
                    {item.company && item.position ? ' — ' : ''}
                    {item.position}
                  </Text>
                  <Text style={styles.dates}>
                    {item.startDate}
                    {item.startDate && item.endDate ? ' - ' : ''}
                    {item.endDate}
                  </Text>
                </View>
                {item.description ? (
                  <MarkdownText
                    content={item.description}
                    style={styles.experienceDescription}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills Section */}
        {data.metadata.atsSkills && data.metadata.atsSkills.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>
              {data.metadata.atsSkills.join(', ')}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
