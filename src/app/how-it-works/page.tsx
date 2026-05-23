import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoLead,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function HowItWorksPage() {
  return (
    <InfoPageLayout title="How it works">
      <InfoTitle>How Burnline works</InfoTitle>
      <InfoLead>
        Know what you can spend today and still protect your savings target.
        Enter spends as they happen. Beat today. Repeat.
      </InfoLead>

      <InfoH2>1. Set your income and pay cycle</InfoH2>
      <InfoP>
        Tell Burnline what hits your account and when you get paid. The pay
        cycle is the period Burnline uses for cycle position — not a calendar
        month unless that matches your payday.
      </InfoP>

      <InfoH2>2. Set your savings target</InfoH2>
      <InfoP>
        Savings is protected money. It shapes your daily line but is not
        treated as something you &quot;spent&quot; when you stay under today.
      </InfoP>

      <InfoH2>3. Add fixed costs and recurring bills</InfoH2>
      <InfoP>
        Rent, subscriptions, insurance — anything that should sit in your fixed
        daily burn. You can log bill payments to refine estimates over time.
      </InfoP>

      <InfoH2>4. Burnline converts them into daily numbers</InfoH2>
      <InfoP>
        Income, savings, and fixed costs are spread across the days in your pay
        cycle so you get one manual daily target — extra you can spend today on
        top of fixed burn.
      </InfoP>

      <InfoH2>5. Enter spends as they happen</InfoH2>
      <InfoP>
        Tap + Add spend on Today. Fast path: amount, category, save. Bigger or
        bill-like spends can be counted today only, spread as a recurring bill,
        or marked already included.
      </InfoP>

      <InfoH2>6. Stay under today&apos;s line</InfoH2>
      <InfoP>
        The hero shows spent today vs today&apos;s line. Under the line is good.
        Over the line means you need to pull it back — usually by beating
        tomorrow.
      </InfoP>

      <InfoH2>7. Track your pay-cycle position</InfoH2>
      <InfoP>
        Across the days you&apos;ve actually tracked in this cycle, Burnline
        compares your manual allowance to manual spend. That is pay-cycle
        position — under or over the line for the cycle so far.
      </InfoP>

      <InfoH2>The maths in plain English</InfoH2>
      <InfoUl>
        <li>
          <strong>Spent today</strong> = fixed daily burn + manual spends today
        </li>
        <li>
          <strong>Today&apos;s line</strong> = fixed daily burn + extra you can
          spend today
        </li>
        <li>
          <strong>Savings protected</strong> = the daily slice of your savings
          goal
        </li>
        <li>
          <strong>Pay-cycle position</strong> = how far under or over the line
          you are across tracked days in this pay cycle
        </li>
      </InfoUl>

      <InfoH2>Tracked days only</InfoH2>
      <InfoP>
        Burnline measures tracked local calendar days in the current pay cycle.
        It does not pretend you spent $0 before you started using the app.
      </InfoP>

      <InfoH2>Recurring bills</InfoH2>
      <InfoP>
        If a bill repeats, Burnline can spread it over its period so a $1,200
        annual bill becomes about $3/day instead of wrecking one day.
      </InfoP>
    </InfoPageLayout>
  );
}
