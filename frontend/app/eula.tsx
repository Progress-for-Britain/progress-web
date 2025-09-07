import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SEOHead from '../components/SEOHead';
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function EULA() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  return (
    <>
      <SEOHead pageKey="eula" />
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>End User License Agreement</Text>
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
              This End User License Agreement ("Agreement") is a legal agreement between you ("User" or "you") and PROGRESS
              ("we," "us," or "our") for the use of our mobile application ("App"). By downloading, installing, or using the App,
              you agree to be bound by the terms and conditions of this Agreement.
            </Text>
          </View>

          {/* License Grant Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="description"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>License Grant</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Subject to your compliance with the terms and conditions of this Agreement, we grant you a limited, non-exclusive,
              non-transferable, revocable license to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Download, install, and use the App on your mobile device</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Access and use the features and services provided through the App</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Access content and materials made available through the App</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              This license is granted solely for your personal, non-commercial use and does not include any right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Modify, adapt, or create derivative works of the App</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Reverse engineer, decompile, or disassemble the App</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Distribute, sublicense, or transfer the App to third parties</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Use the App for any commercial purposes</Text>
            </View>
          </View>

          {/* User Obligations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="assignment"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>User Obligations</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              By using the App, you agree to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Provide accurate and complete information when registering</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Maintain the confidentiality of your account credentials</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Use the App in accordance with applicable laws and regulations</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Respect the rights of other users and third parties</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Not engage in any harmful, offensive, or illegal activities</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Not attempt to circumvent security measures or access restrictions</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Report any security vulnerabilities or breaches to us immediately</Text>
            </View>
          </View>

          {/* Intellectual Property Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="copyright"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Intellectual Property Rights</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              The App and all related content, features, and functionality are owned by PROGRESS and are protected by
              copyright, trademark, and other intellectual property laws. All rights not expressly granted in this Agreement
              are reserved by PROGRESS.
            </Text>

            <Text style={[commonStyles.text, styles.bodyText]}>
              You acknowledge that:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• The App contains proprietary and confidential information</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• You will not remove or alter any copyright notices or trademarks</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Any unauthorized use of our intellectual property is prohibited</Text>
            </View>
          </View>

          {/* Privacy and Data Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="privacy-tip"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Privacy and Data Protection</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy,
              which is incorporated into this Agreement by reference. By using the App, you consent to the collection, use,
              and sharing of your information as described in our Privacy Policy.
            </Text>

            <Text style={[commonStyles.text, styles.bodyText]}>
              You are responsible for:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Protecting your personal information and account security</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Complying with data protection laws in your jurisdiction</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Notifying us of any unauthorized access to your account</Text>
            </View>
          </View>

          {/* Prohibited Uses Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="block"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Prohibited Uses</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              You may not use the App for any unlawful or prohibited purpose, including but not limited to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Violating any applicable laws, regulations, or third-party rights</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Transmitting harmful, offensive, or inappropriate content</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Attempting to gain unauthorized access to our systems</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Interfering with the proper functioning of the App</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Using the App to harass, threaten, or intimidate others</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Collecting or harvesting user data without permission</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Impersonating other individuals or entities</Text>
            </View>
          </View>

          {/* Termination Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="cancel"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Termination</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              This Agreement is effective until terminated. We may terminate this Agreement and your access to the App at any time,
              with or without cause, by providing notice to you. You may terminate this Agreement at any time by deleting the App
              from your device and ceasing all use of our services.
            </Text>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Upon termination:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Your license to use the App will immediately cease</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• You must delete all copies of the App from your devices</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Certain provisions of this Agreement will survive termination</Text>
            </View>
          </View>

          {/* Disclaimer of Warranties Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="warning"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Disclaimer of Warranties</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              TITLE, AND NON-INFRINGEMENT.
            </Text>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We do not warrant that:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• The App will be error-free or uninterrupted</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• All defects will be corrected</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• The App will meet your specific requirements</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• The App is compatible with all devices or systems</Text>
            </View>
          </View>

          {/* Limitation of Liability Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="gavel"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Limitation of Liability</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              IN NO EVENT SHALL PROGRESS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE
              OF THE APP OR INABILITY TO USE THE APP.
            </Text>

            <Text style={[commonStyles.text, styles.bodyText]}>
              Our total liability for any claim arising out of or relating to this Agreement or the App shall not exceed
              the amount paid by you for the App, if any.
            </Text>
          </View>

          {/* Governing Law Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="location-on"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Governing Law</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              This Agreement shall be governed by and construed in accordance with the laws of England and Wales,
              without regard to its conflict of law provisions. Any disputes arising from this Agreement shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </Text>
          </View>

          {/* Changes to Agreement Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="update"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Changes to This Agreement</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              We reserve the right to modify this Agreement at any time. We will notify you of any material changes
              by posting the updated Agreement on this page and updating the "Last updated" date. Your continued use
              of the App after such changes constitutes your acceptance of the modified Agreement.
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
              <Text style={[commonStyles.text, styles.sectionTitle]}>Contact Information</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              If you have any questions about this Agreement, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={[commonStyles.text, styles.contactText]}>• Email: legal@progressparty.uk</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Address: [Your Address Here]</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Phone: [Your Phone Number Here]</Text>
            </View>
          </View>

          {/* Severability Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="call-split"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Severability</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              If any provision of this Agreement is found to be unenforceable or invalid, that provision will be limited
              or eliminated to the minimum extent necessary so that this Agreement will otherwise remain in full force
              and effect and enforceable.
            </Text>
          </View>

          {/* Entire Agreement Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="article"
                size={24}
                color={colors.accent}
                style={styles.sectionIcon}
              />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Entire Agreement</Text>
            </View>

            <Text style={[commonStyles.text, styles.bodyText]}>
              This Agreement, together with our Privacy Policy, constitutes the entire agreement between you and PROGRESS
              regarding the use of the App and supersedes all prior agreements, understandings, or representations.
            </Text>
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