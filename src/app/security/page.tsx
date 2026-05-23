import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoLead,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function SecurityPage() {
  return (
    <InfoPageLayout title="Security">
      <InfoTitle>Security</InfoTitle>
      <InfoLead>
        Burnline holds sensitive personal financial data. Security is treated
        as a product requirement, not a footnote.
      </InfoLead>
      <InfoP>
        Our design is inspired by ISO/IEC 27001-style information-security
        discipline and ISO/IEC 27701-style privacy-management principles.{" "}
        <strong>Burnline is not certified</strong> under those or any other
        standards. There are no compliance badges in the app.
      </InfoP>

      <InfoH2>Security model</InfoH2>
      <InfoP>
        Each user&apos;s data lives in Postgres rows tied to their auth
        account. The web app uses the public anon key with the user&apos;s
        session — not a service role key in browser or app server code paths
        that ship to clients.
      </InfoP>

      <InfoH2>Row Level Security</InfoH2>
      <InfoUl>
        <li>RLS is enabled on user-owned tables</li>
        <li>Policies scope rows to the signed-in user (e.g. user_id = auth.uid())</li>
        <li>
          Bill payments must belong to a bill stream owned by the same user
        </li>
      </InfoUl>

      <InfoH2>Least privilege</InfoH2>
      <InfoUl>
        <li>Route guards decide access on the server — not client-side session guesses</li>
        <li>Server actions set user_id from the session, never from form fields</li>
        <li>Middleware refreshes cookies only; it does not redirect to login</li>
      </InfoUl>

      <InfoH2>Logging and redaction</InfoH2>
      <InfoUl>
        <li>Auth logs are structured and avoid financial payloads</li>
        <li>We do not intentionally log spend amounts, notes, or secrets</li>
        <li>.env.local is gitignored; secrets are not committed to the repo</li>
      </InfoUl>

      <InfoH2>What we intentionally do not do in v1</InfoH2>
      <InfoUl>
        <li>Bank sync (no bank credentials stored)</li>
        <li>Third-party analytics pixels or event pipelines</li>
        <li>Claiming end-to-end encryption of all data in the database</li>
        <li>Displaying ISO certification we do not hold</li>
      </InfoUl>

      <InfoH2>Roadmap</InfoH2>
      <InfoUl>
        <li>Self-service account deletion</li>
        <li>Data export</li>
        <li>Password reset flow</li>
        <li>Security headers and CSP review</li>
        <li>Field-level encryption assessment for free-text notes</li>
        <li>Dependency audit cadence</li>
        <li>Incident response runbook if the app goes fully public</li>
      </InfoUl>
    </InfoPageLayout>
  );
}
