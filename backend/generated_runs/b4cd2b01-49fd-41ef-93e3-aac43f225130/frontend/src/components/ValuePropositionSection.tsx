import React from 'react';

const ValuePropositionSection: React.FC = () => {
  const features = [
    {
      title: 'Single-File Simplicity',
      description: 'Everything you need in one HTML file with embedded CSS and JavaScript.',
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized for performance with no external dependencies to slow you down.',
    },
    {
      title: 'Responsive Design',
      description: 'Looks great on any device with built-in mobile compatibility.',
    },
    {
      title: 'SEO Friendly',
      description: 'Semantic HTML structure for better search engine visibility.',
    },
  ];

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <h2 className="text-center mb-12">Why Choose Our Solution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-light-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;