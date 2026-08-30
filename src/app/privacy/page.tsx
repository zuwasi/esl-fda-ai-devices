import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 30, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              ESL FDA AI Device Intelligence (https://esl-fda.io) is a free public platform operated by
              ESL Engineering Software Lab Ltd. (ESL). This policy explains what data we collect, how we
              use it, and the choices you have.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              We are committed to minimizing data collection. The platform does not require an account,
              login, or any personal information to use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Data We Do NOT Collect</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>No user accounts or login credentials</li>
              <li>No personal identification (name, email, phone) unless you contact us directly</li>
              <li>No form submissions stored on our servers</li>
              <li>No tracking of individual device views or search queries tied to your identity</li>
              <li>No cookies for advertising or cross-site tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data We Collect</h2>
            <h3 className="font-medium text-gray-900 mt-4 mb-1">3.1 Anonymous Analytics (if enabled)</h3>
            <p className="text-gray-700 leading-relaxed">
              If Google Analytics is enabled, it collects anonymous, aggregate usage data such as page
              views, approximate geographic region (country/city level), device type (mobile/desktop),
              and referral source. This data is not linked to your identity and cannot be used to
              identify you personally.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Google Analytics uses cookies. You can block these cookies through your browser settings
              or by using a privacy extension. The platform functions identically with or without
              analytics cookies enabled.
            </p>
            <h3 className="font-medium text-gray-900 mt-4 mb-1">3.2 Server Logs</h3>
            <p className="text-gray-700 leading-relaxed">
              Our hosting provider (Railway) may automatically log standard server request metadata
              (IP address, timestamp, user agent) for security and operational purposes. These logs are
              retained for a limited period and are not associated with personal identity.
            </p>
            <h3 className="font-medium text-gray-900 mt-4 mb-1">3.3 Contact Emails</h3>
            <p className="text-gray-700 leading-relaxed">
              If you contact us via email (sales@eswlab.com) or through the ESL contact form at
              eswlab.com, we receive your email address and message content. This is used solely to
              respond to your inquiry and is not added to any marketing list without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform fetches data from public FDA APIs (openFDA, FDA.gov) in real time. These
              requests are made server-side and do not transmit your personal data to the FDA.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-700">Service</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Your data sent?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-600">FDA openFDA API</td>
                    <td className="py-2 text-gray-600">Recalls, adverse events</td>
                    <td className="py-2 text-gray-600">No</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">FDA.gov</td>
                    <td className="py-2 text-gray-600">Warning letters, PDF summaries</td>
                    <td className="py-2 text-gray-600">No</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Google Analytics</td>
                    <td className="py-2 text-gray-600">Anonymous usage statistics</td>
                    <td className="py-2 text-gray-600">Aggregate only (not identifiable)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Railway</td>
                    <td className="py-2 text-gray-600">Hosting and CDN</td>
                    <td className="py-2 text-gray-600">IP address (server logs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              This platform does not set any cookies of its own. If Google Analytics is enabled, it may
              set first-party analytics cookies (_ga, _ga_*). These are not advertising cookies.
              You can disable them in your browser settings without affecting platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. GDPR (European Union)</h2>
            <p className="text-gray-700 leading-relaxed">
              Under the General Data Protection Regulation (GDPR), you have the right to access,
              rectify, erase, restrict, object to, or port your personal data. Since we do not collect
              personal data tied to your identity (no accounts, no profiles), these rights primarily
              apply to any direct email correspondence you initiate with us. To exercise any of these
              rights, contact us at privacy@eswlab.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. CCPA (California)</h2>
            <p className="text-gray-700 leading-relaxed">
              Under the California Consumer Privacy Act (CCPA), California residents have the right to
              know what personal information is collected, request deletion, and opt out of the sale of
              personal information. We do not sell personal information. For questions, contact
              privacy@eswlab.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Children Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              This platform is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us personal data, please
              contact privacy@eswlab.com and we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              Server logs are retained by our hosting provider for operational purposes, typically
              30-90 days. Email correspondence is retained as needed to provide services. Analytics
              data (if enabled) is retained by Google Analytics according to their default retention
              period (14 months).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy as the platform evolves. The Last updated date at the
              top of this page indicates when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Contact</h2>
            <p className="text-gray-700 leading-relaxed">Questions about this privacy policy? Contact us:</p>
            <ul className="list-none pl-0 space-y-1 text-gray-700 mt-2">
              <li>Email: <a href='mailto:privacy@eswlab.com' className='text-blue-600 hover:underline'>privacy@eswlab.com</a></li>
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