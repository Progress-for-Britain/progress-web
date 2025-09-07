import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SEOHead from '../components/SEOHead';
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
      <SEOHead pageKey="privacy-policy" />
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
              At PROGRESS, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              mobile application and related services.
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

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Personal Information</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We may collect personal information that you provide directly to us, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Name and contact information (email, phone number)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Address and location data</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Political interests and volunteer information</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Event participation and donation history</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Communication preferences</Text>
            </View>

            <Text style={[commonStyles.text, styles.subsectionTitle]}>Automatically Collected Information</Text>
            <Text style={[commonStyles.text, styles.bodyText]}>
              When you use our app, we may automatically collect:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Device information (device type, operating system)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Usage data and app interactions</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• IP address and location information</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Log data and crash reports</Text>
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

            <Text style={[commonStyles.text, styles.bodyText]}>
              We use the information we collect for various purposes, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Providing and maintaining our services</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Processing donations and event registrations</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Communicating with you about our activities and events</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Personalizing your experience and content</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Improving our app and services</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Ensuring security and preventing fraud</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Complying with legal obligations</Text>
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
              We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• With your explicit consent</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• To comply with legal obligations or court orders</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• To protect our rights, property, or safety</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• With trusted service providers who assist our operations (under strict confidentiality agreements)</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• In connection with a business transfer or merger</Text>
            </View>
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
              Our app may use cookies and similar tracking technologies to enhance your experience and analyze usage patterns.
              You can control cookie settings through your device settings or app preferences.
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
              <Text style={[commonStyles.text, styles.contactText]}>• Address: [Your Address Here]</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Phone: [Your Phone Number Here]</Text>
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
    marginBottom: 40,
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: isMobile ? 14 : 16,
    opacity: 0.7,
    marginTop: 8,
  },
  bodyText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    textAlign: isMobile ? 'left' : 'justify',
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: isMobile ? 20 : 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 20,
    marginTop: 12,
  },
  bulletPoint: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    marginBottom: 8,
  },
  contactInfo: {
    marginTop: 16,
  },
  contactText: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
    marginBottom: 8,
  },
});