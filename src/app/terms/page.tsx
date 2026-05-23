import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoLead,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function TermsPage() {
  return (
    <InfoPageLayout title="Terms">
      <InfoTitle>Terms and disclaimer</InfoTitle>
      <InfoLead>
        Plain English draft for early v1 — not final legal advice. Review before
        a public launch.
      </InfoLead>

      <InfoH2>What Burnline is</InfoH2>
      <InfoP>
        Burnline is a budgeting and spend-awareness tool. It helps you see a
        daily line and track position through a pay cycle based on what you
        enter.
      </InfoP>

      <InfoH2>What Burnline is not</InfoH2>
      <InfoUl>
        <li>Not financial advice</li>
        <li>Not a guarantee you will hit savings goals</li>
        <li>Not a bank, lender, or investment service</li>
        <li>Not a substitute for your own records or professional advice</li>
      </InfoUl>

      <InfoH2>Your responsibility</InfoH2>
      <InfoUl>
        <li>Calculations depend on the numbers and categories you enter</li>
        <li>You are responsible for checking figures and your own decisions</li>
        <li>v1 has no bank sync — accuracy depends on manual entry</li>
        <li>Do not rely on Burnline as your only financial record</li>
      </InfoUl>

      <InfoH2>Acceptable use</InfoH2>
      <InfoP>
        Do not misuse the service, attack it, scrape other users&apos; data, or
        attempt to access accounts that are not yours.
      </InfoP>

      <InfoH2>Early v1</InfoH2>
      <InfoP>
        Features, copy, and calculations may change as the product develops.
        We will try not to break your trust; we cannot promise zero bugs.
      </InfoP>

      <InfoH2>Problems</InfoH2>
      <InfoP>
        If something looks wrong — especially the maths — report it via{" "}
        <a href="/contact" className="font-medium text-brand-blue underline">
          Contact
        </a>
        .
      </InfoP>
    </InfoPageLayout>
  );
}
