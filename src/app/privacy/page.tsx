import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoLead,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function PrivacyPage() {
  return (
    <InfoPageLayout title="Privacy">
      <InfoTitle>Privacy</InfoTitle>
      <InfoLead>
        Your financial data is sensitive. Burnline is designed on the assumption
        that income, rent, bills, savings targets, and spending notes are
        private.
      </InfoLead>
      <InfoP>
        This page is a clear draft for early v1. It is not lawyer-reviewed final
        legal text. We will tighten it before any serious public launch.
      </InfoP>

      <InfoH2>What we collect</InfoH2>
      <InfoUl>
        <li>Email and account identity (Supabase Auth)</li>
        <li>Currency, financial timezone, and profile settings</li>
        <li>Income amount and pay cycle settings</li>
        <li>Savings target</li>
        <li>Fixed costs and bill streams</li>
        <li>Bill payments</li>
        <li>Manual spends</li>
        <li>Optional notes or descriptions you type</li>
      </InfoUl>

      <InfoH2>What we do not collect in v1</InfoH2>
      <InfoUl>
        <li>Bank account login details</li>
        <li>Bank transaction feeds</li>
        <li>Card numbers</li>
        <li>Investment account data</li>
        <li>Location tracking</li>
        <li>Third-party analytics events</li>
      </InfoUl>

      <InfoH2>How we use your data</InfoH2>
      <InfoUl>
        <li>To calculate today&apos;s line and spent today</li>
        <li>To calculate pay-cycle position</li>
        <li>To show bill streams and fixed costs</li>
        <li>To keep your account data in sync when you log in</li>
      </InfoUl>

      <InfoH2>What we do not do</InfoH2>
      <InfoUl>
        <li>We do not sell your personal financial data</li>
        <li>We do not run ads based on your spending</li>
        <li>We do not use third-party analytics in v1</li>
        <li>We do not offer bank sync in v1</li>
      </InfoUl>

      <InfoH2>Security summary</InfoH2>
      <InfoUl>
        <li>Supabase Auth for sign-in</li>
        <li>Postgres with Row Level Security on user-owned rows</li>
        <li>No service role key in the frontend app</li>
        <li>We do not intentionally log amounts, notes, or tokens in app logs</li>
      </InfoUl>
      <InfoP>
        See the <a href="/security" className="font-medium text-brand-blue underline">Security</a> page for more detail.
      </InfoP>

      <InfoH2>Honest caveat</InfoH2>
      <InfoP>
        No app can promise perfect security. The goal is to collect as little as
        practical, protect it properly, and avoid creepy data practices.
      </InfoP>

      <InfoH2>Deletion and export</InfoH2>
      <InfoP>
        Account deletion and data export are planned before any serious public
        launch. Until then, use{" "}
        <a href="/contact" className="font-medium text-brand-blue underline">
          Contact
        </a>{" "}
        for requests. We will not ask for your password by email.
      </InfoP>
    </InfoPageLayout>
  );
}
