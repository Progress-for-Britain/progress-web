import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function PrivacyPolicy() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  return (
    <>
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>Privacy Policy</Text>
            <Text style={[commonStyles.text, styles.lastUpdated]}>
              Last updated: {new Date().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Introduction Section */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              At PROGRESS, we are committed to protecting your privacy and keeping your data secure.
              This Privacy Policy explains what we collect, how we use it, how long we keep it,
              and the choices you have when you use our website, app, and related services (the “Services”).
            </Text>
          </View>

          {/* Information We Collect Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="info"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Information We Collect</Text>
            </View>

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Account and Profile</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>We collect the information you provide when you register or manage your account:</Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• First name, last name, and email address</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Password (stored using one‑way hashing)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Address and constituency (if provided)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Roles and preferences (notification and privacy settings)</Text>
            </View>

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Membership, Events, and Donations</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>If you apply to join, attend events, volunteer, or donate, we collect:</Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Pending membership application details: phone (optional), interests, newsletter preference, brief bio/CV, skills you can contribute, citizenship and UK residency, other affiliations, NDA agreement, and GDPR consent (for volunteers)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Event participation records and volunteer hours (attendance, status, notes)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Donation/subscription records: amounts, currency, plan, billing interval, status, and Stripe customer/subscription IDs (we do not store full card details)</Text>
            </View>

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Discord Linking</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>
              If you link your Discord account, we store your Discord username and process a short‑lived verification code and Discord user ID to complete linking.
            </Text>

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Technical and Authentication Data</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>To secure your account and our Services, we collect:</Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• IP address, user agent, and device type when issuing refresh tokens</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Login status via JSON Web Tokens (JWTs)</Text>
            </View>
          </View>

          {/* How We Use Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="how-to-reg"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>How We Use Your Information</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>We use your information to:</Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Provide and improve the Services</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Process donations and manage subscriptions</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Manage membership applications, roles, and event participation</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Communicate with you about updates, events, and opportunities</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Detect, prevent, and investigate fraud, abuse, or security incidents</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Comply with legal obligations</Text>
            </View>
          </View>

          {/* Information Sharing Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="share"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Information Sharing and Disclosure</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We do not sell your personal information. We share limited data with service providers to operate the Services:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Payments: Stripe processes payments; we store customer/subscription IDs and amounts only</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Email: Resend sends transactional emails (e.g., application confirmations, verifications)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Community: Discord linking for role access (Discord username and verification data)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Hosting and infrastructure: database and application hosting providers</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Legal and compliance: when required by law or to protect our rights</Text>
            </View>
          </View>

          {/* Legal Bases Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="balance"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Legal Bases</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Where UK/EU data protection law applies, we process data based on: performance of a contract (providing the Services),
              your consent (e.g., newsletters or volunteer details), legitimate interests (security, service improvement), and legal obligations (tax and accounting).
            </Text>
          </View>

          {/* Data Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="security"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Data Security</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. These measures include:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Encryption of data in transit and at rest</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Secure authentication and access controls</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Regular security audits and updates</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Limited access to personal data on a need-to-know basis</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Secure data disposal procedures</Text>
            </View>
          </View>

          {/* Data Retention Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="schedule"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Data Retention</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We keep personal data only as long as necessary for the purposes above:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Refresh tokens: typically 30 days</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Pending applications: unreviewed for 90 days are removed; approved/rejected applications may be removed after ~30 days</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Donations/subscriptions: retained as required by tax and accounting laws</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Account data: retained while your account is active; deleted or anonymised upon request where feasible</Text>
            </View>
          </View>

          {/* Your Rights Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="gavel"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Your Rights</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Under applicable data protection laws, you have the following rights regarding your personal information:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to access your personal data</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to rectify inaccurate data</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to erase your data ("right to be forgotten")</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to restrict processing</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to data portability</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Right to object to processing</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              To exercise these rights, please contact us using the information provided below.
            </Text>
          </View>

          {/* Cookies and Tracking Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="cookie"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Cookies and Tracking Technologies</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We primarily use token‑based authentication stored on your device (not third‑party advertising cookies).
              Stripe Checkout and similar third‑party services may set essential cookies to operate their features.
              You can control cookies through your browser or device settings.
            </Text>
          </View>

          {/* International Transfers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="public"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>International Transfers</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Our service providers may process data outside the UK/EU. Where required, we rely on appropriate safeguards (such as standard contractual clauses)
              to protect your information.
            </Text>
          </View>

          {/* Children's Privacy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="child-care"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Children's Privacy</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information
              from children under 13. If we become aware that we have collected personal information from a child under 13,
              we will take steps to delete such information.
            </Text>
          </View>

          {/* Changes to Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="update"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Changes to This Privacy Policy</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
              on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </Text>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="contact-mail"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Contact Us</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={[commonStyles.text, styles.contactText]}>• Email: privacy@progressparty.uk</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Address: Provided upon request</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Phone: Provided upon request</Text>
            </View>
          </View>

          {/* Add extra space at the bottom for mobile scroll */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const getStyles = (colors: any, isMobile: boolean, width: number) => StyleSheet.create({
  heroSection: {
    marginBottom: 50,
    alignItems: 'flex-start',
  },
  lastUpdated: {
    fontSize: isMobile ? 15 : 17,
    opacity: 0.7,
    marginTop: 10,
  },
  bodyText: {
    fontSize: isMobile ? 17 : 19,
    lineHeight: isMobile ? 26 : 30,
    textAlign: isMobile ? 'left' : 'justify',
  },
  section: {
    marginBottom: 50,
    paddingHorizontal: isMobile ? 20 : 40,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    fontSize: isMobile ? 19 : 22,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 15,
  },
  bulletList: {
    marginLeft: 20,
    marginTop: 15,
  },
  bulletPoint: {
    fontSize: isMobile ? 17 : 19,
    lineHeight: isMobile ? 26 : 30,
    marginBottom: 10,
  },
  contactInfo: {
    marginTop: 20,
  },
  contactText: {
    fontSize: isMobile ? 17 : 19,
    lineHeight: isMobile ? 26 : 30,
    marginBottom: 10,
  },
});
