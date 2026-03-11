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

## Role & Company at a Glance
_Fill in key facts about the company, team, and role from your research._

| | |
|-|-|
| Company | |
| Role | |
| Team | |
| Interviewer(s) | |
| Interview date | |

---

## Research Checklist

### Company Strategy
- [ ] What does the company do, and who are its main customers?
- [ ] What are the company's stated strategic priorities this year?
- [ ] What are the biggest challenges or headwinds the business faces?
- [ ] Who are the main competitors, and how is this company differentiated?
- [ ] What is the company's culture and values (from careers page, Glassdoor, LinkedIn)?

### Team & Role
- [ ] What team does this role sit in, and what does that team own?
- [ ] What does success look like in the first 30 / 90 / 180 days?
- [ ] What are the key technical or domain skills required?
- [ ] What growth opportunities exist from this role?
- [ ] Who would I work most closely with?

### Your Narrative
- [ ] Why this company, specifically?
- [ ] Why this role, at this stage of your career?
- [ ] What unique perspective or experience do you bring?
- [ ] What are the top 3 things you want them to know about you?

---

## Stories to Prepare (STAR Format)

Use the **Situation → Task → Action → Result** structure for each story.

| Theme | Story summary | Key result / metric |
|-------|--------------|---------------------|
| Problem solving under pressure | | |
| Learning something new quickly | | |
| Influencing without authority | | |
| Receiving and acting on critical feedback | | |
| Driving a project to completion | | |
| Handling conflict or disagreement | | |
| Failure or setback and recovery | | |

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

## Questions to Ask the Interviewer

### On the Role
- What does success look like in the first 90 days?
- What are the biggest challenges I'd face in this role?
- How would you describe the day-to-day rhythm of the team?

### On Team Dynamics
- How does this team collaborate with other teams?
- How is feedback typically given and received?
- What do you enjoy most about working here?

### On the Company
- What's the most important thing the company needs to achieve in the next 12 months?
- How does leadership communicate strategy to the team?
- What does career progression look like from this role?

---

## Logistics Checklist
- [ ] Confirm interview format (in-person / video / phone)
- [ ] Confirm interviewers' names and LinkedIn profiles
- [ ] Set aside 30 min to review these notes the morning of
- [ ] Prepare your background / environment if video call
- [ ] Have a copy of your CV and the job description open
`;
