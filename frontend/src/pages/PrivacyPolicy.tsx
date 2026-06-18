import Layout from '../components/Layout';
import { PARISH_NAME, PARISH_DIOCESE } from '../components/Map';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">How we collect, use, and protect your information</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                At {PARISH_NAME}, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and use our services.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                By using our website, you consent to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  📋
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-800">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-primary-700">Personal Information</h3>
                  <p className="leading-relaxed">
                    We may collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>Register as a parishioner</li>
                    <li>Make a donation</li>
                    <li>Contact us through our website</li>
                    <li>Subscribe to our newsletters or announcements</li>
                    <li>Participate in events or ministries</li>
                  </ul>
                  <p className="mt-3 leading-relaxed">
                    This information may include your name, email address, phone number, mailing address, 
                    and other contact details.
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-2 text-primary-700">Automatically Collected Information</h3>
                  <p className="leading-relaxed">
                    When you visit our website, we may automatically collect certain information about your device, 
                    including information about your web browser, IP address, time zone, and some of the cookies 
                    that are installed on your device.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  🔒
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-lg">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4 text-lg">
                  <li>To provide, maintain, and improve our services</li>
                  <li>To process donations and manage parishioner records</li>
                  <li>To send you announcements, newsletters, and updates about parish activities</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To notify you about changes to our services or policies</li>
                  <li>To detect, prevent, and address technical issues</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  🛡️
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Data Protection</h2>
              </div>
              <div className="space-y-4 text-gray-800">
                <p className="leading-relaxed text-lg">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. However, no method 
                  of transmission over the Internet or electronic storage is 100% secure.
                </p>
                <p className="leading-relaxed text-lg">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined 
                  in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  🍪
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Cookies and Tracking Technologies</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-lg">
                  We use cookies and similar tracking technologies to track activity on our website and store certain 
                  information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
                </p>
                <p className="leading-relaxed text-lg">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                  However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  🔗
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-gray-800">
                <p className="leading-relaxed text-lg">
                  Our website may contain links to third-party websites or services that are not owned or controlled 
                  by {PARISH_NAME}. We are not responsible for the privacy practices of these third-party services.
                </p>
                <p className="leading-relaxed text-lg">
                  We may use third-party payment processors (such as PayPal) to process donations. These services 
                  have their own privacy policies, and we encourage you to review them.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  ✅
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Your Rights</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-lg">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4 text-lg">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Rectify inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to processing of your personal information</li>
                  <li>Request restriction of processing your personal information</li>
                  <li>Withdraw consent at any time where we rely on consent to process your information</li>
                </ul>
                <p className="mt-4 leading-relaxed text-lg">
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  👶
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Children's Privacy</h2>
              </div>
              <div className="space-y-4 text-gray-800">
                <p className="leading-relaxed text-lg">
                  Our website is not intended for children under the age of 13. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe that your child has 
                  provided us with personal information, please contact us immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl shadow-lg">
                  📝
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-800">Changes to This Privacy Policy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed text-lg">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p className="leading-relaxed text-lg">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
                  Policy are effective when they are posted on this page.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-10 shadow-xl text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  📧
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Contact Us</h2>
              </div>
              <div className="space-y-4 text-primary-100">
                <p className="leading-relaxed text-lg">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-white/10 rounded-xl p-6 mt-4">
                  <p className="text-lg font-semibold mb-2">{PARISH_NAME}</p>
                  <p className="mb-1">{PARISH_DIOCESE}</p>
                  <p className="mt-4">
                    <a 
                      href="/contact" 
                      className="text-white hover:text-primary-100 underline font-semibold"
                    >
                      Visit our Contact Page
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

