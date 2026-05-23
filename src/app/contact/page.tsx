import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contact">
      <InfoTitle>Contact / support</InfoTitle>
      <InfoP>
        Burnline is early. If something looks wrong — especially the maths —
        report it.
      </InfoP>

      <InfoH2>Support email</InfoH2>
      <InfoP>
        <strong>Support email to be added before public launch.</strong>
      </InfoP>
      <InfoP>
        We are not publishing a placeholder address that might bounce or get
        scraped. When there is a real inbox, it will appear here and in
        Settings.
      </InfoP>

      <InfoH2>What to include</InfoH2>
      <InfoUl>
        <li>What happened</li>
        <li>What page you were on</li>
        <li>What you expected vs what you saw</li>
        <li>A screenshot if it helps</li>
        <li>Do not send passwords, magic links, or API secrets</li>
      </InfoUl>

      <InfoH2>Privacy requests</InfoH2>
      <InfoP>
        For deletion or export requests before self-service exists, use the same
        channel once it is live, or the Contact route from a signed-in account.
        See <a href="/privacy" className="font-medium text-brand-blue underline">Privacy</a>.
      </InfoP>
    </InfoPageLayout>
  );
}
