import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import "./PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
return ( <div className="privacy-page">
{/* Navbar */} <Navbar />


  <main className="privacy-container">
    {/* Back to Home */}
    <Link to="/" className="privacy-back-link">
      <ArrowLeft size={18} />
      <span>Back to Home</span>
    </Link>

    {/* Page Header */}
    <div className="privacy-header">
      <div className="privacy-icon">
        <ShieldCheck size={42} />
      </div>

      <h1>Privacy Policy</h1>

      <p>
        Your privacy matters to us. Learn how Eduverse collects,
        uses, and protects your information when you use our
        learning platform.
      </p>
    </div>

    <p className="privacy-updated">
      Last updated: October 2026
    </p>

    {/* Section 1 */}
    <section className="privacy-section">
      <h2>1. Introduction</h2>
      <p>
        Welcome to Eduverse, an online learning platform designed
        to connect students and instructors and make learning
        accessible. This Privacy Policy explains how information
        may be collected, used, stored, and protected when you
        access or use our website and services.
      </p>
    </section>

    {/* Section 2 */}
    <section className="privacy-section">
      <h2>2. Information We Collect</h2>
      <p>
        Depending on the features you use, Eduverse may collect
        the following types of information:
      </p>

      <ul>
        <li>
          <strong>Account information:</strong> Your name, email
          address, and other details provided during registration.
        </li>
        <li>
          <strong>Profile information:</strong> Profile details,
          learning interests, and other information you choose
          to share.
        </li>
        <li>
          <strong>Learning activity:</strong> Course enrolments,
          progress, completed lessons, and related activity.
        </li>
        <li>
          <strong>Communications:</strong> Messages, feedback,
          or information submitted through platform features.
        </li>
        <li>
          <strong>Technical information:</strong> Basic device,
          browser, and usage information where needed to operate
          and secure the platform.
        </li>
      </ul>
    </section>

    {/* Section 3 */}
    <section className="privacy-section">
      <h2>3. How We Use Your Information</h2>
      <p>Information may be used to:</p>

      <ul>
        <li>Create, maintain, and manage user accounts.</li>
        <li>Provide courses and educational services.</li>
        <li>Track learning progress and display relevant activity.</li>
        <li>Send important account and service notifications.</li>
        <li>Respond to questions and support requests.</li>
        <li>Improve platform functionality and user experience.</li>
        <li>Detect misuse and help protect platform security.</li>
      </ul>
    </section>

    {/* Section 4 */}
    <section className="privacy-section">
      <h2>4. Information Sharing</h2>
      <p>
        We do not intend to sell your personal information.
        Information may be shared when necessary to provide
        requested services, maintain the platform, comply with
        applicable legal requirements, or protect the rights and
        safety of users and the platform.
      </p>
      <p>
        Access to personal information should be limited to
        authorized people and service providers who need it
        for legitimate purposes.
      </p>
    </section>

    {/* Section 5 */}
    <section className="privacy-section">
      <h2>5. Data Storage and Security</h2>
      <p>
        Eduverse aims to use reasonable safeguards to protect
        information against unauthorized access, loss, misuse,
        or alteration. These safeguards may include access
        controls and appropriate technical security measures.
      </p>
      <p>
        However, no method of internet transmission or electronic
        storage can be guaranteed to be completely secure.
      </p>
    </section>

    {/* Section 6 */}
    <section className="privacy-section">
      <h2>6. Cookies and Similar Technologies</h2>
      <p>
        The platform may use cookies or similar technologies
        where necessary for features such as authentication,
        preferences, functionality, and security. The specific
        technologies used depend on the features implemented
        in Eduverse.
      </p>
    </section>

    {/* Section 7 */}
    <section className="privacy-section">
      <h2>7. Your Privacy Choices</h2>
      <p>
        You may be able to review or update certain account
        information through your profile or account settings.
        You can also contact the Eduverse team if you have
        questions about your information or need assistance
        with your account.
      </p>
      <p>
        Requests to access, correct, or delete personal
        information will be handled in accordance with
        applicable requirements and the platform's capabilities.
      </p>
    </section>

    {/* Section 8 */}
    <section className="privacy-section">
      <h2>8. Children's Privacy</h2>
      <p>
        Eduverse aims to handle children's personal information
        responsibly and in accordance with applicable laws.
        Where required, appropriate consent and safeguards
        should be established before collecting or processing
        children's information.
      </p>
    </section>

    {/* Section 9 */}
    <section className="privacy-section">
      <h2>9. Third-Party Services</h2>
      <p>
        Eduverse may rely on third-party services to support
        functions such as authentication, hosting, or data
        storage. Those services may process information as
        needed to provide their functions and are subject to
        their own terms and privacy practices.
      </p>
    </section>

    {/* Section 10 */}
    <section className="privacy-section">
      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        This Privacy Policy may be updated as Eduverse evolves
        or its features and practices change. Any revisions
        will be published on this page with an updated
        revision date.
      </p>
      <p>
        We encourage users to review this page periodically.
      </p>
    </section>

    {/* Section 11 */}
    <section className="privacy-section">
      <h2>11. Contact Us</h2>
      <p>
        If you have questions, concerns, or requests regarding
        this Privacy Policy, please contact the Eduverse team
        using the contact information provided on our website.
      </p>
    </section>

    {/* Important Note */}
    <div className="privacy-note">
      <strong>Important:</strong> This is a starter policy for
      the Eduverse project. Before launching the platform for
      real users, ensure that this policy accurately reflects
      the information your application collects, how it is used,
      your actual security practices, and applicable legal
      requirements.
    </div>

    {/* Return Home */}
    <div className="privacy-footer">
      <Link to="/" className="privacy-home-link">
        <ArrowLeft size={18} />
        Return to Home
      </Link>
    </div>
  </main>
</div>


);
};

export default PrivacyPolicy;
