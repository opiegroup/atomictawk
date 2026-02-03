import { getSiteSettings, getSocialLinks, SiteSettings, SocialLink, defaultSiteSettings, defaultSocialLinks } from "@/lib/siteSettings";
import { ContactClient } from "./ContactClient";

export default async function ContactPage() {
  // Fetch data server-side
  let settings: SiteSettings;
  let socialLinks: SocialLink[];

  try {
    settings = await getSiteSettings();
  } catch (e) {
    settings = defaultSiteSettings;
  }

  try {
    socialLinks = await getSocialLinks('contact');
  } catch (e) {
    socialLinks = defaultSocialLinks;
  }

  return <ContactClient settings={settings} socialLinks={socialLinks} />;
}
