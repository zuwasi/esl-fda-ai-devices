import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 30, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using ESL FDA AI Device Intelligence (https://esl-fda.io), you agree to
              these Terms of Use. If you do not agree, please do not use the platform. These terms
              constitute a legally binding agreement between you and ESL Engineering Software Lab Ltd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. What This Platform Is</h2>
            <p className="text-gray-700 leading-relaxed">
              ESL FDA AI Device Intelligence is a free public web platform that provides semantic search
              across FDA-authorized AI medical devices, regulatory risk monitoring (recalls, adverse
              events, warning letters) from public FDA data, cybersecurity evidence analysis (SBOM and
              xBOM indicators), IEC 62304 risk class estimation, and submission readiness self-assessment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. No Medical or Regulatory Advice</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed font-medium">This platform is an assistive research tool. It does NOT provide:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                <li>Medical advice, diagnosis, or treatment recommendations</li>
                <li>Legal advice or regulatory counsel</li>
                <li>FDA approval, clearance, or endorsement</li>
                <li>A substitute for professional regulatory affairs consultation</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">
              The manufacturer retains full responsibility for the safety, effectiveness, and regulatory
              compliance of their device. Any decisions based on information from this platform should
              be verified against official FDA sources and reviewed with qualified regulatory professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Data Accuracy and Limitations</h2>
            <p className="text-gray-700 leading-relaxed">While we strive for accuracy, the platform has inherent limitations:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
              <li>Device data is sourced from FDA public AI device list and may not reflect the most recent updates</li>
              <li>Cybersecurity evidence analysis is based on AI-generated device summaries or FDA Summary PDFs, not the complete submission package</li>
              <li>Regulatory concerns are fetched in real time from public FDA APIs and may have delays</li>
              <li>IEC 62304 risk classification is an ESL estimate, not an official FDA classification</li>
              <li>The platform may make errors. Always verify critical information against primary sources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to overload, crash, or disrupt the platform or its APIs</li>
              <li>Scrape, crawl, or extract data at automated rates that degrade service for others</li>
              <li>Misrepresent the platform output as official FDA determinations</li>
              <li>Use the platform to make medical decisions without consulting a healthcare professional</li>
              <li>Reverse engineer, decompile, or attempt to access the platform source code or infrastructure</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              Reasonable automated access for research purposes is permitted. If you need bulk data access,
              contact us at sales@eswlab.com to discuss an API arrangement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform source code is based on the open-source FDA AI Search project by Kavishwar &
              Lotter (Dana-Farber / Harvard, ML4H 2025, CC BY 4.0). ESL enhancements including the
              regulatory risk monitoring, cybersecurity evidence analysis, xBOM detection, IEC 62304
              classification, and assessment wizard are proprietary to ESL. Device data displayed on the
              platform is sourced from public FDA databases and is in the public domain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform is provided AS IS and AS AVAILABLE without warranties of any kind, either
              express or implied, including but not limited to accuracy, completeness, timeliness,
              merchantability, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, ESL shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of (or
              inability to use) the platform. You acknowledge that the platform is a free service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform contains links to external sites (FDA.gov, Parasoft, eswlab.com). ESL is not
              responsible for the content, accuracy, or practices of these third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. No FDA Endorsement</h2>
            <p className="text-gray-700 leading-relaxed">
              ESL FDA AI Device Intelligence is not affiliated with, endorsed by, or sponsored by the
              U.S. Food and Drug Administration. FDA is used descriptively to refer to the public data
              and regulations administered by the agency.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may revise these Terms of Use at any time. Your continued use of the platform after
              changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the State
              of Israel. Any disputes shall be resolved in the competent courts of Tel Aviv, Israel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">13. Contact</h2>
            <p className="text-gray-700 leading-relaxed">Questions about these Terms of Use? Contact us:</p>
            <ul className="list-none pl-0 space-y-1 text-gray-700 mt-2">
              <li>Email: <a href='mailto:legal@eswlab.com' className='text-blue-600 hover:underline'>legal@eswlab.com</a></li>
              <li>Contact form: <a href='https://eswlab.com/contact-us/' target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>https://eswlab.com/contact-us/</a></li>
              <li>Phone: +972 9 8855803</li>
              <li>Address: Ha-Nagar 24 A, Hod Hasharon, Israel</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}