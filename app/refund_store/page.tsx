import React from 'react';

const RefundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
      <div className="prose">
        <h2>1. Refund Eligibility</h2>
        <p>We offer a 14-day refund policy for Dify workflows purchased on our Store. To be eligible for a refund, you must meet the following conditions:</p>
        <ul>
          <li>The workflow was purchased through our official Store platform.</li>
          <li>You can provide a valid proof of purchase.</li>
          <li>You agree to stop using the workflow and remove it from your Dify account after the refund.</li>
          <li>You have not exceeded the reasonable usage limit of the workflow (see details below).</li>
        </ul>

        <h2>2. Refund Exceptions</h2>
        <p>We may not be able to provide a refund in the following cases:</p>
        <ul>
          <li>The purchase was made more than 14 days ago.</li>
          <li>The workflow has been excessively used (e.g., used more than 50 times or processed over 1GB of data).</li>
          <li>You have violated our Terms of Service.</li>
          <li>You purchased the workflow through unofficial channels.</li>
          <li>You have already received a refund for the same workflow.</li>
        </ul>

        <h2>3. Refund Process</h2>
        <ol>
          <li>Visit our official website www.store.aihouse.asia/refund and fill out the refund request form.</li>
          <li>Provide your order number, purchase date, and reason for the refund in the form.</li>
          <li>Upload a valid proof of purchase (such as receipt or order confirmation email).</li>
          <li>Our customer service team will review your application within 3 business days.</li>
          <li>If approved, the refund will be processed within 7 business days.</li>
        </ol>

        <h2>4. Refund Method</h2>
        <p>Refunds will be issued to your original payment method. Processing times may vary depending on the payment platform:</p>
        <ul>
          <li>Credit Card: 3-5 business days</li>
          <li>PayPal: 1-2 business days</li>
          <li>Bank Transfer: 5-7 business days</li>
        </ul>
        <p>If the original payment method cannot receive the refund, we will contact you to determine an alternative refund method.</p>

        <h2>5. Partial Refunds</h2>
        <p>For certain situations, we may offer partial refunds. This will be evaluated based on the following factors:</p>
        <ul>
          <li>Duration of workflow usage</li>
          <li>Number and size of processed files or operations</li>
          <li>Whether advanced features were used</li>
        </ul>

        <h2>6. Post-Refund Consequences</h2>
        <p>Once the refund is completed:</p>
        <ul>
          <li>Your license to use the Dify workflow will be revoked.</li>
          <li>You must immediately stop using the workflow and remove it from your Dify account.</li>
          <li>You will lose access to any results or outputs generated using the workflow.</li>
          <li>Future purchases of the same workflow may be restricted.</li>
        </ul>

        <h2>7. Policy Changes</h2>
        <p>We reserve the right to modify this refund policy at any time. Any changes will be posted on this page and will be effective immediately upon posting. Significant changes will be communicated to registered users via email.</p>

        <p className="mt-8 font-bold">If you have any questions about refunds, please contact our customer support team:</p>
        <ul>
          <li>Email: hfloveyy@icloud.com</li>
          <li>Website: www.aihouse.asia</li>
        </ul>
      </div>
    </div>
  );
};

export default RefundPage;