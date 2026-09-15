import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Static Code Analysis Alone Is Not Enough: Adding Unit Testing & Code Coverage | ESL',
  description: 'Why medical-device software teams should add unit testing and code coverage to their existing static code analysis - lessons from seven FDA enforcement cases.',
};

const GAP_CARDS = [
  { num: '1', title: 'No evidence of correct behavior', text: 'A clean scan cannot show that a function produces the right output for valid inputs, boundary values, invalid inputs, and error conditions. Only executed tests with expected results can.' },
  { num: '2', title: 'No visibility into unexercised code', text: 'System-level black-box tests can pass while large parts of the internal logic - error branches, recovery paths, edge cases - are never executed at all. Without coverage measurement, nobody knows.' },
  { num: '3', title: 'No proof that a fix worked', text: 'Correcting a reported coding pattern is not the same as demonstrating the required behavior is correct. FDA has cited companies for fixing source-code defects without validating the correction\u2019s effectiveness.' },
];

const FDA_CASES = [
  { co: 'Inovo', date: 'Feb 19, 2015', gap: 'Missing code-level structural verification documentation, missing software validation procedures, and inadequate regression-testing procedures. FDA explicitly referenced static code checkers and independent code review.' },
  { co: 'Xoran Technologies', date: 'Dec 9, 2024', gap: 'System-level black-box testing without component/integration testing documentation; FDA questioned whether code coverage was commensurate with software risk.' },
  { co: 'Abiomed', date: 'Sep 19, 2023', gap: 'A source-code correction (a counter that failed to reset) was not validated to establish the fix\u2019s effectiveness.' },
  { co: 'ZYTO Technologies', date: 'Jun 21, 2023', gap: 'Verification documentation marked \u201capproved\u201d despite no evidence that the specified tests had actually been executed.' },
  { co: 'Visgeneer', date: 'Jun 13, 2025', gap: 'Validation records could not be consistently tied to the tested software configuration; version inconsistencies across validation reports.' },
  { co: 'Compass International Innovations', date: 'May 23, 2011', gap: 'Retrospective validation lacked updated requirements, source-code evaluation, and user-site testing.' },
  { co: 'iRhythm Technologies', date: 'May 25, 2023', gap: 'A reuse process lacked verification of its required operational outcome - previous patient data was not verifiably erased before devices were distributed.' },
];

interface CaseCard {
  company: string;
  title: string;
  letterUrl: string;
  letterLabel: string;
  fdaGap: string;
  steps: Array<{ bold: string; rest: string }>;
  netEffect: string;
}

const CASE_CARDS: CaseCard[] = [
  {
    company: 'Inovo', title: 'missing code-level verification',
    letterUrl: 'https://www.ofnisystems.com/media/ucm436707.pdf', letterLabel: 'FDA Letter: Observation 4(a), p.3',
    fdaGap: 'missing software-development/validation procedures, missing code-level structural verification documentation, and inadequate regression-testing procedures. FDA explicitly referenced static code checkers and independent code review.',
    steps: [
      { bold: 'Defined code-level verification (Parasoft C/C++test, dotTEST, PythonStator):', rest: 'static analysis executed through the real build with a versioned test configuration stored in the repository - a defined engineering activity with an executed record, exactly the artifact chain Observation 4(a) found missing.' },
      { bold: 'Documented regression procedure (cpptestcc changed-code analysis):', rest: 'every source change triggers an incremental scan and re-test of the changed code, with results retained per run - the regression procedure exists, is executed, and is demonstrable on demand.' },
      { bold: 'Independent code review, structured and recorded (Parasoft DTP review workflow):', rest: 'analyzer findings seed a recorded peer-review process with named reviewers and dispositions, replacing the undocumented reviews FDA criticized.' },
      { bold: 'Evidence over time (Parasoft DTP):', rest: 'dashboards retain every run\u2019s findings, dispositions, and tool/configuration identity, showing continuous execution rather than a one-time scanner installation.' },
    ],
    netEffect: 'code analysis becomes a documented, executed, and reviewable activity with regression and independent-review records - closing each element of Observation 4(a).',
  },
  {
    company: 'Xoran Technologies', title: 'system testing did not establish adequate internal testing',
    letterUrl: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/xoran-technologies-llc-694229-12092024', letterLabel: 'FDA Letter: Observation 2',
    fdaGap: 'system-level black-box testing without component/integration testing documentation; FDA questioned the regression analysis and whether code coverage was commensurate with software risk.',
    steps: [
      { bold: 'Baseline code examination (Parasoft C/C++test static analysis):', rest: 'agreed MISRA/CERT/security configurations run over every owned component through the real build - documented, repeatable code-level examination of internal logic, not just product-level black-box results.' },
      { bold: 'Component and integration tests where none exist (C++test unit testing):', rest: 'auto-generated test harnesses and stubs for the modules the product-level suite never reaches, plus targeted tests for internal interfaces, boundary conditions, and error paths - with expected and actual results per test.' },
      { bold: 'Risk-matched coverage evidence (C/C++test coverage):', rest: 'statement and branch coverage (MC/DC where the risk file justifies it) per module, compared against the documented software risk classification - a direct answer to FDA\u2019s \u201ccommensurate with risk\u201d question.' },
      { bold: 'Regression records per change (cpptestcc changed-code analysis):', rest: 'incremental static analysis and re-testing restricted to changed code for every fix batch, enabling the retrospective review of earlier changes that the response omitted.' },
      { bold: 'Same workflow for mixed code and auditable aggregation (dotTEST, PythonStator, Parasoft DTP):', rest: 'C#/Python components get identical evidence, and findings, tests, and coverage are aggregated per module and linked to source revisions and configurations.' },
    ],
    netEffect: 'each gap FDA cited - missing component/integration testing documentation, questioned regression analysis, and coverage not matched to risk - is closed by a named Parasoft capability with a retained artifact.',
  },
  {
    company: 'Abiomed', title: 'a corrected defect still needed verification',
    letterUrl: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/abiomed-inc-663150-09192023', letterLabel: 'FDA Letter: Observation 2(B)',
    fdaGap: 'a counter that failed to reset, allowing report data to carry over from a previous test, was corrected in source - but FDA found the corrective action had not been validated to establish effectiveness.',
    steps: [
      { bold: 'Reproduce the defect as a test (C++test unit testing):', rest: 'an auto-generated harness with a test that exercises the counter-reset behavior and fails on the original code. A defect that can be reproduced in a test can be proven fixed.' },
      { bold: 'Demonstrate effectiveness (failing-before / passing-after record):', rest: 'the fix is accepted only when the same test passes on the corrected build, with both runs retained - the effectiveness validation FDA found missing.' },
      { bold: 'Verify nothing else broke (cpptestcc changed-code regression):', rest: 'incremental static analysis and re-testing of all code touched by the change, plus a full re-scan of the module, so the correction cannot silently introduce new findings.' },
      { bold: 'Link fix to evidence (Parasoft DTP):', rest: 'the change record connects the reviewed patch, the tool version, the source revision, and the passing test run, making the corrective action\u2019s effectiveness auditable.' },
    ],
    netEffect: 'the corrective action is validated by a reproducible test record rather than by the disappearance of the reported symptom - precisely what Observation 2(B) required.',
  },
  {
    company: 'ZYTO Technologies', title: 'approval without execution evidence',
    letterUrl: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/zyto-technologies-inc-652316-06212023', letterLabel: 'FDA Letter: QS Observation 1',
    fdaGap: 'verification documentation marked approved despite missing evidence that the specified tests were ever performed.',
    steps: [
      { bold: 'Execution evidence generated by the tool, not typed by hand (C++test / dotTEST test runs):', rest: 'every test execution automatically produces machine-generated results with timestamp, tool version, configuration, and source revision - an approved document can only exist where a matching execution record exists.' },
      { bold: 'Execution history that cannot be backfilled (Parasoft DTP):', rest: 'results are uploaded as produced and retained server-side with run history, so \u201capproved but never executed\u201d becomes detectable by comparing approval dates against recorded runs.' },
      { bold: 'Automatic evidence index:', rest: 'the package for each module (scan results, test runs, dispositions, approvals) is generated from DTP with hashes and cross-references, replacing hand-assembled summaries.' },
      { bold: 'Tool validation built in:', rest: 'QMS validation of the analyzers uses the recorded tool version and configuration identity, so results are traceable to a validated tool state.' },
    ],
    netEffect: 'approvals reference retained execution artifacts automatically - closing the approved-without-execution gap of QS Observation 1.',
  },
  {
    company: 'Visgeneer', title: 'validation evidence could not be tied consistently to the product',
    letterUrl: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/visgeneer-inc-709010-06132025', letterLabel: 'FDA Letter: Observation 1',
    fdaGap: 'missing configuration records for tested devices, and version inconsistencies across validation reports (2.1 vs 2.5) that were never explained.',
    steps: [
      { bold: 'Every run bound to an exact configuration (C/C++test / dotTEST + cpptestcc):', rest: 'each scan and test execution records the source revision, analyzer configuration, and build inputs, so the tested configuration is identifiable after the fact.' },
      { bold: 'Version-to-version explanation (changed-code analysis):', rest: 'comparing the analysis results of version 2.1 against 2.5 produces an explicit list of what changed and which verifications remain valid - directly answering FDA\u2019s unanswered version-discrepancy question.' },
      { bold: 'Configuration records for tested devices (Parasoft DTP):', rest: 'run history per release candidate is retained with build and configuration identity, giving the per-device configuration records FDA could not find.' },
      { bold: 'Acceptance criteria under control:', rest: 'rule sets, severities, and scope are fixed in versioned configurations; changing them requires a recorded change, preventing the broadened-acceptance-criteria practice FDA criticized.' },
    ],
    netEffect: 'validation evidence carries its exact tested configuration and a documented path between versions - closing the traceability gaps of Observation 1.',
  },
  {
    company: 'Compass International Innovations', title: 'retrospective testing did not repair missing lifecycle evidence',
    letterUrl: 'https://www.ofnisystems.com/media/ucm257575.pdf', letterLabel: 'FDA Letter: Observation 1',
    fdaGap: 'missing validation procedures and plans; later retrospective validation lacked updated requirements, source-code evaluation, and user-site testing.',
    steps: [
      { bold: 'Source-code evaluation for the retrospective effort (Parasoft C/C++test static analysis):', rest: 'a full documented analysis of the existing source gives the retrospective validation the source-code evaluation element it lacked.' },
      { bold: 'Requirements-linked tests, not ad-hoc testing (C++test unit testing + traceability):', rest: 'tests are written against identified requirements with traceability maintained in Parasoft DTP, so the retrospective program has the requirements link FDA found missing.' },
      { bold: 'Validation procedures and plans that exist on paper first:', rest: 'the analysis plan, rule configuration, and test plan are written and approved before execution, so the retrospective record includes the missing procedures and plans.' },
      { bold: 'Prioritized, defensible scope:', rest: 'risk-ranked findings and coverage direct the retrospective effort to safety-relevant modules first, with dispositions recorded for every finding.' },
    ],
    netEffect: 'retrospective validation is executed under an approved plan, with source evaluation and requirements traceability included - rather than repeating the incomplete program of Observation 1.',
  },
  {
    company: 'iRhythm Technologies', title: 'executing a process did not prove its intended outcome',
    letterUrl: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/irhythm-technologies-inc-643474-05252023', letterLabel: 'FDA Letter: QS Observation 3',
    fdaGap: 'a reuse process lacked verification that previous patient data had been erased from circuit boards - products were distributed with prior patient data remaining.',
    steps: [
      { bold: 'Outcome-based tests, not process-based ones (C++test unit testing):', rest: 'tests assert the required outcome itself - for example, that a data-erasure routine leaves no residue - rather than merely confirming that the erasure procedure was invoked.' },
      { bold: 'State hazards exercised (harnesses and stubs):', rest: 'auto-generated stubs simulate the reuse scenarios behind the finding - successive operations on the same hardware, stale data present, interrupted processing, and recovery after failure - each with expected results.' },
      { bold: 'Contributing defects found statically (Parasoft C/C++test):', rest: 'data-flow and security configurations flag uninitialized reads, missing cleanup paths, and unreachable error handling that could leave data behind, so code-level causes are fixed alongside the outcome tests.' },
      { bold: 'Proof the safety path is exercised (C/C++test coverage):', rest: 'coverage measurement confirms the erasure and recovery paths are actually executed by the tests, and changed-code regression keeps them tested on every future change.' },
    ],
    netEffect: 'the required operational outcome is verified directly, including failure and recovery conditions - closing the gap of QS Observation 3, where the process ran but the outcome was never checked.',
  },
];

const ENGAGEMENT_CARDS = [
  { num: '1', title: 'Evidence & gap assessment', text: 'Assessment of your existing tests, requirements traceability, and current coverage - identifying whether you have a code defect problem, a test gap, a documentation gap, or a combination.' },
  { num: '2', title: 'Risk-based unit test development', text: 'Development of unit tests for identified gaps, with expected results derived from requirements - including boundaries, invalid inputs, error handling, and safety controls.' },
  { num: '3', title: 'Coverage metrics & targets', text: 'Agreed, risk-appropriate coverage metrics and targets, with documented review and treatment of every uncovered code area.' },
  { num: '4', title: 'Defect-specific regression testing', text: 'Every correction gets a test that reproduces the defect, verifies the fix\u2019s effectiveness, and remains in the regression suite. Fixed code is verified, not just rescanned.' },
  { num: '5', title: 'Final evidence package', text: 'Results, coverage, deviations, and reviews tied to the exact release candidate - source revision, build, and configuration - ready for your regulatory submission.' },
  { num: '+', title: 'Requirements traceability', text: 'Import requirements, associate them with test cases, and identify requirements without linked tests - closing the lifecycle gap FDA cited at Compass and Inovo.' },
];

export default function UnitTestingCaseStudyPage() {
  return (
    <div>
      <Header />
      <main className="bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-amber-500 text-blue-900 px-3 py-1 rounded-full mb-5">
              Executive Brief for Software Teams
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
              Static Code Analysis Alone <span className="text-amber-400">Is Not Enough</span>:<br />
              Add <span className="text-amber-400">Unit Testing &amp; Code Coverage</span> to Your Verification Program
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Seven FDA enforcement cases. One consistent pattern: teams that passed system-level testing
              and managed static-analysis findings were <strong>still cited for missing code-level verification</strong>.
              This brief shows the gap - and how ESL closes it with <strong>unit testing and code coverage</strong>,
              added to the static analysis you already have.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100"><b>7</b> FDA cases analyzed</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100"><b>1</b> consistent gap</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100">&#10004; Unit testing</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100">&#10004; Code coverage</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-800 text-blue-100">&#10004; Submission-ready evidence</span>
            </div>
            <div className="mt-8 rounded-2xl overflow-hidden border border-blue-800 max-w-3xl">
              <img src="/images/case-studies/hero-team.png" alt="Software engineering team reviewing test results, code coverage, and system architecture on monitors" className="w-full" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {/* 1. The gap */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. The Gap Static Analysis Leaves Open</h2>
            <p className="text-gray-600 mb-3">
              Static code analysis examines source code for defect patterns, unsafe constructs, and coding-standard
              violations. It is an essential layer of any medical-device software verification program - and it is
              what FDA inspectors increasingly expect to see. But static analysis has a structural limit:
              <strong> it examines code as text; it never executes the code.</strong>
            </p>
            <p className="text-gray-600 mb-6">That limit shows up in three ways that FDA findings repeatedly target:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {GAP_CARDS.map(card => (
                <div key={card.num} className="bg-white rounded-xl border border-gray-200 p-5">
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-blue-800 text-white text-sm font-bold mb-3">{card.num}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.text}</p>
                </div>
              ))}
            </div>
            <blockquote className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg text-gray-800 italic">
              &ldquo;Executing code does not prove its result was correct.&rdquo;
              <span className="block text-xs not-italic text-gray-500 mt-1">- The central lesson of the seven FDA cases analyzed with ESL</span>
            </blockquote>
          </section>

          {/* 2. Seven cases table */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Seven FDA Enforcement Cases at a Glance</h2>
            <p className="text-gray-600 mb-6">
              ESL&rsquo;s research into recent FDA software-related enforcement actions identified seven cases that
              illustrate this pattern. They are FDA enforcement findings at issuance - not seven demonstrated
              submission rejections - but together they map exactly where code-level verification evidence
              goes missing.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm bg-white">
                <thead>
                  <tr className="bg-blue-800 text-white text-left">
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Letter date</th>
                    <th className="px-4 py-3 font-semibold">Verification gap FDA identified</th>
                  </tr>
                </thead>
                <tbody>
                  {FDA_CASES.map(row => (
                    <tr key={row.co} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-semibold text-blue-800 whitespace-nowrap">{row.co}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 text-gray-700">{row.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              The strongest direct precedent for unit testing and coverage is <strong>Xoran</strong>: FDA explicitly questioned
              whether code coverage was &ldquo;commensurate with risk&rdquo; and requested procedures for regression testing and
              adequate coverage. Abiomed supports defect-specific regression testing; ZYTO supports detailed execution
              reporting; Compass supports requirements traceability.
            </p>
          </section>

          {/* 3. Case-by-case cards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. What Each Case Teaches - and How ESL Solves It with Parasoft</h2>
            <p className="text-gray-600 mb-6">
              For every case below, the card links directly to the FDA letter and the specific observation,
              and shows how ESL would have closed that exact gap with Parasoft tools - extending the static
              analysis you already have with unit testing, code coverage, and traceable evidence.
            </p>
            <div className="space-y-6">
              {CASE_CARDS.map(card => (
                <div key={card.company} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 flex-wrap p-5 border-b-4 border-amber-500 bg-blue-50">
                    <h3 className="font-bold text-gray-900">{card.company} - {card.title}</h3>
                    <a href={card.letterUrl} target="_blank" rel="noopener noreferrer"
                       className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-800 text-white hover:bg-blue-700 whitespace-nowrap">
                      {card.letterLabel} &#8599;
                    </a>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-700 mb-4"><strong>The FDA gap:</strong> {card.fdaGap}</p>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600">How ESL solves it with Parasoft tools</span>
                      <ol className="list-decimal list-inside space-y-2 mt-3 text-sm text-gray-700">
                        {card.steps.map((s, i) => <li key={i}><strong>{s.bold}</strong> {s.rest}</li>)}
                      </ol>
                      <p className="text-sm text-gray-800 mt-3 pt-3 border-t border-gray-200">
                        <strong>Net effect:</strong> {card.netEffect}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              The strongest direct precedent for unit testing and coverage is <strong>Xoran</strong>: FDA explicitly questioned
              whether code coverage was &ldquo;commensurate with risk&rdquo; and requested procedures for regression testing and
              adequate coverage. Abiomed supports defect-specific regression testing; ZYTO supports detailed execution
              reporting; Compass supports requirements traceability.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-gray-700">
              <strong>Honest positioning:</strong> these cases establish FDA&rsquo;s findings at issuance. They do not establish
              that purchasing a particular tool would have prevented the incidents. The justified conclusion is that a
              repeatable, risk-based unit-testing and coverage capability addresses the <em>same types of verification
              failures</em> FDA identified - with earlier detection, verified corrections, and reviewable evidence.
            </div>
          </section>

          {/* 4. FDA guidance reasons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Two Reasons to Add Unit Testing and Coverage - Straight from FDA Guidance</h2>
            <h3 className="font-semibold text-gray-900 mb-2">Reason 1 - Unit testing demonstrates expected behavior</h3>
            <p className="text-gray-600 mb-5">
              Tests should derive expected results from requirements and design, including boundaries, invalid inputs,
              error handling, and safety controls. For Enhanced Documentation Level submissions, FDA
              <em> recommends providing all unit and integration test protocols and reports - including expected results,
              actual results, and objective pass/fail determinations</em>{' '}
              (<a href="https://www.fda.gov/media/153781/download" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA software submission guidance, section VI.H(2)</a>).
            </p>
            <h3 className="font-semibold text-gray-900 mb-2">Reason 2 - Code coverage identifies the gaps your tests never reached</h3>
            <p className="text-gray-600 mb-5">
              A passing test suite may never execute a critical error branch. FDA&rsquo;s software validation guidance relates
              structural coverage to risk, states that <em>statement coverage alone provides insufficient confidence</em>,
              and describes <em>decision/branch coverage as a minimum for most software products</em>{' '}
              (<a href="https://www.fda.gov/media/73141/download" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA software-validation guidance, sections 5.2.4-5.2.5</a>).
              There is no universal mandatory percentage or universal MC/DC requirement - the right metric is the one
              commensurate with your software&rsquo;s risk, exactly the question FDA asked Xoran.
            </p>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-sm text-gray-700">
              <strong>The complementarity principle:</strong> coverage complements assertions. Coverage tells you which code
              executed; assertions tell you whether it behaved correctly. Static analysis complements both by finding defect
              patterns before any code runs. A mature verification program needs all three.
            </div>
          </section>

          {/* 5. How ESL extends */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. How ESL Extends Your Static Analysis Program</h2>
            <p className="text-gray-600 mb-6">
              ESL delivers unit testing and code coverage as a controlled extension of the static code analysis
              programs we already run for our customers. Our recommended engagement adds five core elements,
              completed by requirements traceability:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {ENGAGEMENT_CARDS.map(card => (
                <div key={card.num} className="bg-white rounded-xl border border-gray-200 p-5">
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-amber-500 text-blue-900 text-sm font-bold mb-3">{card.num}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.text}</p>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tool support: Parasoft C/C++test</h3>
            <p className="text-gray-600 mb-3">
              For C/C++ codebases, ESL builds this capability on{' '}
              <a href="https://www.parasoft.com/products/parasoft-c-ctest/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Parasoft C/C++test</a>,
              which unifies static analysis, unit testing, stubbing, and structural coverage in one platform:
              automatic test-case generation with configurable stubs for isolation, execution on host or target,
              coverage collection including branch, simple condition, and MC/DC, detailed test-execution reports
              (inputs, outputs, passed assertions, failures, execution logs), and requirements traceability.{' '}
              <a href="https://www.parasoft.com/white-paper/how-to-perform-unit-testing-with-code-coverage-on-target/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">See the Parasoft white paper on unit testing with code coverage on target &raquo;</a>
            </p>
            <p className="text-sm text-gray-500">
              Reporting detail and requirements traceability must be configured and licensed before execution - ESL scopes
              both explicitly in every engagement, so your evidence is captured correctly the first time.
            </p>
          </section>

          {/* 6. On-target */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Unit Testing and Coverage on Target Hardware</h2>
            <p className="text-gray-600 mb-6">
              For embedded medical devices, the behavior that matters lives on the target hardware - with its own
              embedded OS, constrained memory, and different toolchain. Host-based testing alone cannot expose
              target-specific defects, and attack surfaces of embedded devices are hard to simulate on a host.
              Cross-platform testing lets the same test suite run on host, simulator, and the actual target,
              with results and coverage collected back for analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <figure className="bg-white rounded-xl border border-gray-200 p-4">
                <img src="/images/case-studies/parasoft-v-model.png" alt="V-model of software development with Unit Testing highlighted as validating Module Design" className="w-full rounded-lg" />
                <figcaption className="text-xs text-gray-500 mt-3">
                  The V-model: each testing phase validates a development phase. <strong>Unit testing validates the module
                  design</strong> - the level where the Xoran and Abiomed findings occurred. Image source: Parasoft.
                </figcaption>
              </figure>
              <figure className="bg-white rounded-xl border border-gray-200 p-4">
                <img src="/images/case-studies/parasoft-host-target.png" alt="Host and target testing workflow: download and test over JTAG, serial, or Ethernet, with results communicated back to the host" className="w-full rounded-lg" />
                <figcaption className="text-xs text-gray-500 mt-3">
                  Unit testing and code coverage on target: the instrumented application and run-time library execute on the
                  embedded board; results and coverage flow back to the host over JTAG, serial, Ethernet, or sockets.
                  Image source: Parasoft.
                </figcaption>
              </figure>
            </div>
            <p className="text-sm text-gray-500">
              Traceability between test cases, test results, source code, and requirements must be recorded and maintained -
              which is why collecting test results and coverage data during target-based testing is critical for
              standards compliance (IEC 62304) and FDA submission evidence alike.
            </p>
          </section>

          {/* 7. Supportable claim */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. The Supportable Claim</h2>
            <p className="text-gray-600 mb-3">
              ESL&rsquo;s tools, engineering review, controlled remediation, and evidence workflow address the same types of
              verification failures FDA identified in these seven cases. Their value is earlier detection, verified
              corrections, and reviewable evidence. Complete regulatory acceptance remains dependent on the product,
              the full submission, and your team&rsquo;s execution of its own responsibilities - automated analysis does not
              replace human review, and tests using stubs alone do not establish correct integration.
            </p>
            <p className="text-gray-600 mb-6">That is precisely why we state it this way, and why our customers&rsquo; auditors and reviewers accept it.</p>
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 text-sm text-gray-700">
              <strong>What you gain by adding unit testing and coverage to your existing static analysis:</strong>
              <ul className="list-disc list-inside space-y-1.5 mt-3">
                <li>Direct answers to the question FDA asked Xoran: is your coverage commensurate with risk?</li>
                <li>Verified - not just corrected - defect fixes, per the Abiomed finding</li>
                <li>Executed-test evidence behind every approval, per the ZYTO finding</li>
                <li>Baseline-attributable reports, per the Visgeneer finding</li>
                <li>A submission-ready evidence package aligned with FDA&rsquo;s Enhanced Documentation recommendations</li>
              </ul>
            </div>
          </section>

          {/* 8. Sources */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sources and Further Reading</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-700 space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">FDA Warning Letters (the seven cases)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Inovo, Feb 19, 2015 - observation 4: <a href="https://www.ofnisystems.com/media/ucm436707.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">original letter (Ofni Systems archive)</a></li>
                  <li>Xoran Technologies, Dec 9, 2024 - <a href="https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/xoran-technologies-llc-694229-12092024" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA letter, observation 2</a></li>
                  <li>Abiomed, Sep 19, 2023 - <a href="https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/abiomed-inc-663150-09192023" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA letter, observation 2(B)</a></li>
                  <li>ZYTO Technologies, Jun 21, 2023 - <a href="https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/zyto-technologies-inc-652316-06212023" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA letter, quality-system observation 1</a></li>
                  <li>Visgeneer, Jun 13, 2025 - <a href="https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/visgeneer-inc-709010-06132025" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA letter, observation 1</a></li>
                  <li>Compass International Innovations, May 23, 2011 - <a href="https://www.ofnisystems.com/media/ucm257575.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">original letter (Ofni Systems archive)</a></li>
                  <li>iRhythm Technologies, May 25, 2023 - <a href="https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/irhythm-technologies-inc-643474-05252023" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA letter, quality-system observation 3</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">FDA Guidance Documents</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://www.fda.gov/media/153781/download" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA software submission guidance</a> - section VI.H(2): unit and integration test protocols and reports for Enhanced Documentation Level</li>
                  <li><a href="https://www.fda.gov/media/73141/download" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA software-validation guidance</a> - sections 5.2.4-5.2.5: structural coverage and risk</li>
                  <li><a href="https://www.fda.gov/media/71794/download" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">FDA OTS software guidance</a> - sections III.C-D: testing and supplier assurance for off-the-shelf components</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Parasoft</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://www.parasoft.com/white-paper/how-to-perform-unit-testing-with-code-coverage-on-target/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">White paper: How to Perform Unit Testing With Code Coverage on Target</a> - cross-platform testing, target test executables, runtime library, and coverage collection (images in this brief are from this white paper)</li>
                  <li><a href="https://www.parasoft.com/products/parasoft-c-ctest/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Parasoft C/C++test</a> - static analysis, unit testing, stubbing, and coverage for C/C++</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ESL Case Analysis Notes (AI-assisted)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://chatgpt.com/s/t_6aa8eff279188191be2e618a0eae98e0" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Case-by-case mapping of the seven FDA findings to unit-testing and coverage capabilities</a></li>
                  <li><a href="https://chatgpt.com/s/t_6aa8efe8d7548191a7f5622d746bffaf" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Analysis of FDA guidance on unit testing, structural coverage, and the supportable commercial claim</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Close the Gap?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-3">
              ESL will assess your current static analysis, test, and coverage posture and propose a risk-based plan
              for adding unit testing and code coverage - scoped to your codebase and your regulatory pathway.
            </p>
            <p className="text-blue-100 text-sm mb-6">
              Contact ESL - Engineering Software Lab - <a href="mailto:sales@eswlab.com" className="text-amber-400 font-semibold hover:underline">sales@eswlab.com</a>
              {'  '}&bull;{'  '}<a href="https://www.eswlab.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-semibold hover:underline">www.eswlab.com</a>
            </p>
            <a href="https://eswlab.com/contact-us/?your-subject=FDA%20Software%20Evidence%20Scoping%20Workshop"
              target="_blank" rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-amber-500 text-blue-900 font-semibold rounded-lg hover:bg-amber-400">
              Contact ESL &rarr;
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
