import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SEOHead from '../components/SEOHead';
import { getCommonStyles, getColors } from '../util/commonStyles';
import { useTheme } from '../util/theme-context';
import { useResponsive } from '../util/useResponsive';

export default function TermsOfService() {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const colors = getColors(isDark);
  const styles = getStyles(colors, isMobile, width);

  return (
    <>
      <SEOHead pageKey="terms-of-service" />
      <View style={commonStyles.appContainer}>
        <ScrollView contentContainerStyle={commonStyles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={commonStyles.title}>Terms of Service</Text>
            <Text style={[commonStyles.text, styles.lastUpdated]}>
              Last updated: {new Date().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[commonStyles.text, styles.bodyText]}>
              These Terms of Service ("Terms") govern your access to and use of PROGRESS websites, apps, and related services
              (the "Services"). By using the Services, you agree to these Terms and our Privacy Policy.
              If you do not agree, do not use the Services.
            </Text>
          </View>

          {/* Eligibility & Accounts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Eligibility and Accounts</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              You must be legally capable of entering into these Terms. You are responsible for safeguarding your account credentials
              and for all activity under your account. Notify us immediately if you suspect unauthorized use.
            </Text>
          </View>

          {/* Use of Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="verified-user" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Use of the Services</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>You agree not to:</Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Violate any law or the rights of others</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Attempt to access accounts or data without authorization</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Interfere with or disrupt the Services</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Upload malware or harmful code</Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>• Impersonate others or misrepresent your affiliation</Text>
            </View>
          </View>

          {/* Membership, Events, and Donations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="event" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Membership, Events, and Donations</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Some features require an account, application review, or payment. Donations and subscriptions are processed by Stripe;
              applicable billing terms, cancellation, and renewal rules are shown during checkout and in your account.
            </Text>
          </View>

          {/* Community & Discord */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="forum" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Community and Discord</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              If you link your Discord account, you agree to comply with our community rules and Discord’s Terms. We may assign
              roles based on your membership status and revoke access if these Terms are violated.
            </Text>
          </View>

          {/* Content & IP */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="copyright" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Content and Intellectual Property</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              The Services and their content are owned by PROGRESS or our licensors and are protected by intellectual property laws.
              You receive a limited, non‑exclusive, non‑transferable license to use the Services for personal, non‑commercial purposes.
            </Text>
          </View>

          {/* Third-Party Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="handshake" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Third‑Party Services</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We use third‑party services such as Stripe (payments), Resend (email), and Discord (community access). Their terms and
              privacy policies govern your use of those services in addition to these Terms.
            </Text>
          </View>

          {/* App Store Terms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="store" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>App Store Terms (Apple & Google)</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              If you downloaded a PROGRESS app via an app store, the store’s terms also apply:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[commonStyles.text, styles.bulletPoint]}>
                • Apple: <Text style={styles.link} onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>Standard EULA</Text>
              </Text>
              <Text style={[commonStyles.text, styles.bulletPoint]}>
                • Google: <Text style={styles.link} onPress={() => Linking.openURL('https://play.google.com/about/play-terms/')}>Google Play Terms of Service</Text>
              </Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Where there is a conflict between these Terms and the applicable store terms, the store terms may control for that distribution.
              Our in‑app End User License Agreement is available at /eula.
            </Text>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="block" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Termination</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We may suspend or terminate access to the Services if you violate these Terms or for security, legal, or operational reasons.
              You may stop using the Services at any time.
            </Text>
          </View>

          {/* Disclaimers & Liability */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Disclaimers and Limitation of Liability</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              The Services are provided “as is” and “as available” without warranties of any kind. To the maximum extent permitted by law,
              PROGRESS will not be liable for indirect, incidental, special, consequential, or punitive damages.
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="gavel" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Governing Law</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              These Terms are governed by the laws of England and Wales, and disputes are subject to the exclusive jurisdiction of the courts of England and Wales.
            </Text>
          </View>

          {/* Changes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="update" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Changes to These Terms</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              We may update these Terms from time to time. We will post updates here and revise the “Last updated” date.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-mail" size={24} color={colors.accent} style={styles.sectionIcon} />
              <Text style={[commonStyles.text, styles.sectionTitle]}>Contact Us</Text>
            </View>
            <Text style={[commonStyles.text, styles.bodyText]}>
              Questions about these Terms? Contact us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={[commonStyles.text, styles.contactText]}>• Email: legal@progressparty.uk</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Address: Provided upon request</Text>
              <Text style={[commonStyles.text, styles.contactText]}>• Phone: Provided upon request</Text>
            </View>
          </View>

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
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});

