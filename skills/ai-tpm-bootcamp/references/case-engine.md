# Case Engine — Finite-State Termination Mechanics

This is the mechanism that guarantees every session ends, regardless of what
the candidate types. Read this before running any live session.

## Stage Sequence

Standard case (Foundations / Tradeoffs / Ambiguity / Executive-pressure):

```
Situation → Clarify → Diagnose → Decision → Curveball → Recommendation → Debrief
```

Capstone case (double loop — a larger case, still a bounded, finite sequence):

```
Situation → Clarify → Diagnose 1 → Decision 1 → Curveball 1
          → Diagnose 2 → Decision 2 → Curveball 2 → Recommendation → Debrief
```

State only moves forward. Once a stage's advance condition or forcing device
fires, that stage is closed: acknowledge the transition in-fiction and never
reopen scoring for it, even if the candidate later references it again as
color commentary.

## Per-Stage Advance Conditions, Turn Caps, and Forcing Devices

Turn caps are phase-relative — see "Phase-Specific Tuning" below for the
exact numbers per phase. This table gives the baseline (Tradeoffs-tier) caps
and the advance condition / forcing device for each stage; phases scale the
numbers, not the mechanic.

| Stage | Candidate must produce to advance | Baseline turn cap | Forcing device if cap hit |
|---|---|---|---|
| Situation | Nothing — chat presents the brief; stage closes the moment the candidate sends any response (including jumping straight to a question or a recommendation). | 1 (no real cap; always advances on first reply) | N/A |
| Clarify | At least one clarifying question, OR an explicit decision to stop clarifying ("I have enough, let's diagnose"). | 3 exchanges | Counterpart cuts it off in-fiction: *"We're burning time — work with what you've got."* Chat moves to Diagnose and treats the gap as a known limitation the candidate now has to reason around. |
| Diagnose | A stated diagnosis or root-cause hypothesis about the problem. | 3 exchanges | *"[Counterpart] leans in: 'What's your working theory — right now, not eventually?'"* Chat records whatever partial reasoning exists as the diagnosis and moves on. |
| Decision | A committed tradeoff call built on the diagnosis. | 3 exchanges | *"The room needs a call before this meeting ends. Thirty seconds — what do we do?"* Chat locks in whatever the candidate last leaned toward, or a stated non-decision if there was none, and moves to Curveball. |
| Curveball | A response to the new complicating fact/objection chat just introduced (hold, revise, or defend the prior decision). | 2 exchanges | *"[Counterpart] isn't waiting: 'I'm proceeding with [default action] unless you tell me otherwise right now.'"* Chat records the default action as what happened and moves to Recommendation. |
| Recommendation | A final, committed recommendation (this stage always ends the case — no further stage follows it except Debrief). | 2 exchanges | *"We need your final answer now."* Chat takes whatever was last said as the final recommendation, however thin, and moves to Debrief. |
| Debrief | Nothing required of the candidate — chat drops character and renders the scorecard. | N/A | N/A |

In the Capstone variant, "Curveball 1" always feeds a new complication into
"Diagnose 2" — never a repeat of Curveball 1's complication — so the second
loop reasons about the *consequences* of Decision 1, not a fresh unrelated
problem.

## Phase-Specific Tuning

| Phase | Clarify cap | Diagnose cap | Decision cap | Curveball cap | Recommendation cap | Notes |
|---|---|---|---|---|---|---|
| Foundations | 4 | 4 | 4 | 3 | 3 | Most lenient. Before firing a forcing device, give one gentle nudge first: *"Anything else you want to ask before we move on?"* |
| Tradeoffs | 3 | 3 | 3 | 2 | 2 | Baseline (the table above). Exhibits are noisier — conflicting numbers the candidate must reconcile, not just read (see curriculum.md). |
| Ambiguity | 4 | 3 | 3 | 2 | 2 | Situation withholds the explicit problem statement — the candidate must scope the problem themselves during Clarify/Diagnose. Clarify cap is extended to 4 to give scoping room; the other caps stay tight. |
| Executive-pressure | 2 | 2 | 2 | 2 | 2 | Shortest caps across the board. Open the Situation stage with an explicit in-fiction ticking clock. The Curveball stage always fires regardless of how well the candidate has handled the case so far — this phase's defining trait is that the pressure is not optional. |
| Capstone | 2 | 2 | 2 | 2 | 2 | Executive-pressure-tier caps, applied to both loops. Recommendation's advance condition changes: the candidate must produce a structured decision memo (recommendation, reasons, impact, risk, mitigation, next step), not just a spoken call. If capped, the forcing device compresses it: *"One paragraph. Sixty seconds. Go."* |

## Counterpart Voice Catalog

Vary the in-fiction counterpart per case (per spec §2's roster) so forcing
devices and curveballs feel differentiated rather than a single generic
"boss":

- **Engineering lead** — blunt, cites one concrete technical constraint (a real number: latency budget, model size, an on-call incident count).
- **Exec** — impatient, time-boxes the candidate explicitly, cares about the bottom line over the mechanism.
- **Sales** — pushes revenue/deal urgency, minimizes downside risk, wants a yes.
- **Legal** — raises compliance/liability, will not move on stated facts or deadlines.
- **Data science** — precise, will correct sloppy metric or statistical reasoning on the spot.
- **Support** — reports frontline user pain, escalates emotionally, wants the symptom fixed now.

## Edge Cases

- **Candidate goes silent or gives a non-answer at the turn cap** — the forcing device fires exactly as scheduled; the case still ends on schedule. A non-answer is not a stall condition, it's just a weak input that gets scored accordingly.
- **Candidate jumps straight to a recommendation from Situation** — allowed. Skip directly to the Recommendation stage's advance condition. The Structuring rubric dimension takes the hit for the skipped stages; the case still ends. A short, weak run is a valid outcome, not an error to be corrected by chat.
- **Candidate derails mid-case (off-topic question)** — chat answers briefly in character if the answer is plausible and doesn't leak the solution; otherwise redirects in character ("the room doesn't have that info — what do you do with what you've got"). A derail never blocks or resets stage progression or consumes more than one turn-cap exchange.
