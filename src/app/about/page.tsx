import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import {
  InfoH2,
  InfoLead,
  InfoP,
  InfoTitle,
  InfoUl,
} from "@/components/info/InfoTypography";

export default function AboutPage() {
  return (
    <InfoPageLayout title="About">
      <InfoTitle>About Burnline</InfoTitle>
      <InfoLead>
        Burnline is a daily spend-speedometer. It exists for people who earn
        enough, should probably be saving more, but still get to the end of the
        month wondering where the money went.
      </InfoLead>
      <InfoP>
        Most budgeting apps ask you to behave like an accountant. Burnline does
        not. It gives you a daily line: stay under it often enough and you
        protect your savings target.
      </InfoP>

      <InfoH2>What you see every day</InfoH2>
      <InfoUl>
        <li>
          <strong>Spent today</strong> — fixed daily burn plus manual spends
          logged today.
        </li>
        <li>
          <strong>Today&apos;s line</strong> — how much you can spend today and
          still stay on track.
        </li>
        <li>
          <strong>Pay cycle position</strong> — how far under or over the line
          you are across the days you&apos;ve tracked this pay cycle.
        </li>
        <li>
          <strong>Fixed costs</strong> — recurring bills spread into a daily
          burn.
        </li>
        <li>
          <strong>Savings protected</strong> — the daily slice of your savings
          goal (not counted as spend).
        </li>
        <li>
          <strong>Manual spend</strong> — what you log as you go.
        </li>
      </InfoUl>

      <InfoH2>What Burnline is not</InfoH2>
      <InfoUl>
        <li>Not a bank-sync app (v1 has no bank connection).</li>
        <li>Not a full personal finance dashboard.</li>
        <li>Not an investment app.</li>
        <li>Not a debt payoff planner.</li>
        <li>Not an AI money coach.</li>
        <li>Not financial advice.</li>
      </InfoUl>

      <InfoP>
        Beat the day. Get through the pay cycle. Repeat.
      </InfoP>
    </InfoPageLayout>
  );
}
