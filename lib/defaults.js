/**
 * Default Markdown templates for the Interview Prep Tool.
 *
 * INTERVIEWER_DEFAULT — a competency-based interview guide template
 * CANDIDATE_DEFAULT   — a candidate preparation guide template
 */

export const INTERVIEWER_DEFAULT = `# Interview Guide

## Role Overview
_Summarise the role, team context, and what success looks like in the first 90 days._

---

## Competency Areas

### 1. Problem Solving & Technical Depth
**What to assess:** Ability to break down ambiguous problems, apply structured thinking, and reason about trade-offs.

| # | Question | Follow-up probes |
|---|----------|-----------------|
| 1 | Describe a technically complex problem you solved recently. What made it hard? | How did you decide on your approach? What did you rule out? |
| 2 | Tell me about a time you had to make a decision with incomplete information. | What was the outcome? What would you do differently? |
| 3 | Walk me through how you would design [relevant system/process for this role]. | How does it scale? Where does it break? |

**Scorecard**
- 1 – No structured approach, vague or generic answers
- 2 – Some structure, limited depth on trade-offs
- 3 – Clear framework, considers alternatives, communicates reasoning
- 4 – Exceptional depth, proactively identifies edge cases, influencing others

---

### 2. Learning Mindset & Adaptability
**What to assess:** Curiosity, openness to feedback, ability to ramp up quickly in new domains.

| # | Question | Follow-up probes |
|---|----------|-----------------|
| 1 | Tell me about something significant you taught yourself in the last year. | What drove you to learn it? How did you approach it? |
| 2 | Describe a time you received critical feedback. How did you respond? | What changed as a result? |
| 3 | When have you had to unlearn something you believed strongly? | What prompted the change? |

**Scorecard**
- 1 – Defensive about feedback, rarely seeks new knowledge
- 2 – Open to feedback but reactive rather than proactive
- 3 – Actively seeks learning, integrates feedback well
- 4 – Builds learning into their process; helps others grow too

---

### 3. Collaboration & Influence
**What to assess:** Ability to work across functions, build trust, and move work forward without direct authority.

| # | Question | Follow-up probes |
|---|----------|-----------------|
| 1 | Describe a project where you had to align stakeholders who disagreed. | How did you build consensus? What would you do differently? |
| 2 | Tell me about a time you pushed back on a decision. | How did you make your case? What was the outcome? |
| 3 | How do you build working relationships with people you disagree with? | Give a specific example. |

**Scorecard**
- 1 – Avoids conflict, or escalates without resolution
- 2 – Can collaborate well in low-friction situations
- 3 – Navigates disagreement constructively, builds durable relationships
- 4 – Creates alignment across competing interests; models collaborative behaviour

---

### 4. Communication & Clarity
**What to assess:** Ability to convey complex ideas clearly to different audiences, written and verbal.

| # | Question | Follow-up probes |
|---|----------|-----------------|
| 1 | Describe a time you had to explain a complex topic to a non-technical audience. | What did you simplify? How did you know it landed? |
| 2 | Tell me about a piece of written communication (doc, proposal, email) that had a significant impact. | What made it effective? |
| 3 | How do you adapt your communication style to different stakeholders? | Give a specific example. |

**Scorecard**
- 1 – Struggles to tailor message to audience; loses people in detail
- 2 – Generally clear but inconsistent with different audiences
- 3 – Adapts confidently; clear, concise, and well-structured
- 4 – Exceptionally clear and persuasive; proactively creates shared understanding

---

## Closing Questions (Candidate for Interviewer)
- What questions do you have about the role or team?
- Is there anything from our conversation you'd like to revisit or add to?

---

## Red Flags to Watch For
_Note anything in the CV or during the interview that warrants further scrutiny._

| Area | Observation from CV / Interview | Follow-up taken |
|------|--------------------------------|-----------------|
| Gaps or short tenures | | |
| Overstatement of scope or impact | | |
| Lack of concrete examples / metrics | | |
| Culture-fit concerns | | |
| Role-specific technical gaps | | |

---

## Overall Assessment

| Competency | Score (1–4) | Notes |
|------------|-------------|-------|
| Problem Solving & Technical Depth | | |
| Learning Mindset & Adaptability | | |
| Collaboration & Influence | | |
| Communication & Clarity | | |
| **Overall** | | |

**Hire / No Hire recommendation:**

**Rationale:**
`;

export const CANDIDATE_DEFAULT = `# Interview Preparation Guide

### Strategy & Business Impact

**Mission & Value:** Beyond the bottom line, how is the company's mission impacting the world?


**Strategic Influence:** How does Engineering Leadership specifically shape the product roadmap and business planning? Can you share a recent example of an Engineering-led pivot?


**Economic Context:** How has the current climate shifted your priorities between hyper-growth, efficiency, and R&D investment?


**Product/Eng Synergy:** How do we resolve friction when OKRs conflict between Product delivery and Engineering health?

### Engineering Culture & Health

**Technical Stewardship:** How is technical debt visualised and prioritised at the leadership level? What is the trigger for addressing systemic architectural issues?


**Innovation vs. Delivery:** How does the organisation protect "deep work" and technical innovation against immediate delivery pressure?


**Crisis Management:** Walk me through the post-mortem of the last major technical crisis. How did leadership support the team during the recovery?

### Role & Team Dynamics

**The "Gap":** Why is this role open now, and what specific problem am I being hired to solve in my first 180 days?


**Success Metrics:** How is "High Performance" defined for an SEM here? What are the leading indicators you look for?


**Talent Strategy:** What is your biggest challenge in attracting and retaining Senior/Staff-level talent right now?


**Autonomy & Authority:** What is the boundary of my decision-making authority regarding cross-team architecture and process?

### Operational Reality

**Tech Stack**: What's the current tech stack? How do we plan to evolve it?


**Logistics:** What are the non-negotiables remote/hybrid workflows, and timezone overlaps?


**Career Growth:** Can you elaborate on career growth opportunities, please?


**Package & Process:** What is the salary benchmark for this level, and what does the remainder of the hiring circuit look like?

---

## Standard Answers

### "Tell me about yourself."
_Draft a 2-minute narrative: current role → key achievements → why this role/company._

> _Your answer here_

---

### "Why do you want to work here?"
_Tie specific company priorities / products / culture signals to your own motivations._

> _Your answer here_

---

### "Why are you leaving your current role?"
_Keep it positive: growth, challenge, alignment with long-term goals._

> _Your answer here_

---

### "What are your greatest strengths?"
_Pick 2–3 strengths directly relevant to this role; back each with a brief example._

> _Your answer here_

---

### "What's a weakness or area you're working on?"
_Choose something real, show self-awareness, and describe concrete steps you're taking._

> _Your answer here_

---

### "Where do you see yourself in 3–5 years?"
_Align your answer with the growth path the role offers._

> _Your answer here_

---

## Logistics Checklist
- [ ] Confirm interview format (in-person / video / phone)
- [ ] Confirm interviewers' names and LinkedIn profiles
- [ ] Set aside 30 min to review these notes the morning of
- [ ] Prepare your background / environment if video call
- [ ] Have a copy of your CV and the job description open
`;
