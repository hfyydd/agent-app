import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose">
        <h2>1. Use of the Store</h2>
        <p>Welcome to the Dify Workflow Store. By using our platform, you agree to comply with the following terms and conditions:</p>
        <ul>
          <li>The Store is designed for buying and selling Dify workflows.</li>
          <li>You agree not to use our platform for any illegal or unauthorized purposes.</li>
          <li>We reserve the right to update or modify the Store's features at any time without prior notice.</li>
        </ul>

        <h2>2. User Responsibilities</h2>
        <p>As a user of the Dify Workflow Store, you have the following responsibilities:</p>
        <ul>
          <li>Ensure you have the right to sell or purchase the workflows you interact with on the Store.</li>
          <li>Take responsibility for all content and workflows you upload or purchase.</li>
          <li>Properly manage and secure your account information.</li>
          <li>Comply with all applicable laws and regulations.</li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <p>Regarding intellectual property on the Dify Workflow Store:</p>
        <ul>
          <li>The Store platform and its related trademarks, logos, and content are our property.</li>
          <li>You may not copy, modify, or distribute our platform without explicit permission.</li>
          <li>Ownership of workflows remains with their respective creators or rightful owners.</li>
        </ul>

        <h2>4. Privacy and Data</h2>
        <p>We respect your privacy. Please refer to our Privacy Policy for details on how we collect, use, and protect your data on the Dify Workflow Store.</p>

        <h2>5. Disclaimer</h2>
        <p>Our platform is provided "as is" without any warranties. We are not responsible for the accuracy, quality, or performance of workflows sold on the Store.</p>

        <h2>6. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, the Dify Workflow Store and its affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages.</p>

        <h2>7. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Modified terms will be made available on the Store. Continued use of our platform indicates your acceptance of the modified terms.</p>
      </div>
    </div>
  );
};

export default TermsPage;