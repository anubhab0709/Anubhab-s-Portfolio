import { useMemo, useState } from 'react';
import SectionHeader from '../components/common/SectionHeader';
import { personalInfo } from '../data/portfolioData';
import { usePortfolioContent } from '../context/contentContext';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

function Contact() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const { socialLinks, resumes } = usePortfolioContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to send message');
      }

      setFormData({ name: '', email: '', subject: '', message: '', company: '' });
      setStatus({ type: 'success', message: 'Thanks! Your message has been sent.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send message right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <SectionHeader label="Reach Out" title="Lets Build" accent="Together" />

      <div className="contact-grid reveal">
        <div>
          <p className="contact-copy">
            Open to internships, freelance work, and full-time opportunities. If you have a product idea or engineering role,
            lets connect.
          </p>
          <div className="contact-links">
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
            <a href={`tel:${personalInfo.phone.replace(/\s/g, '')}`}>{personalInfo.phone}</a>
            <span>{personalInfo.location}</span>
          </div>
        </div>

        <div className="social-links">
          {socialLinks.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
          {resumes.map((item) => (
            <a key={`${item.label}-${item.href}`} href={item.href} target="_blank" rel="noreferrer">
              {item.isPrimary ? `${item.label} (Primary)` : item.label}
            </a>
          ))}
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={120}
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={254}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            maxLength={160}
          />
          <textarea
            name="message"
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={handleChange}
            required
            maxLength={2000}
            rows={6}
          />
          <input
            className="hp-field"
            type="text"
            name="company"
            tabIndex="-1"
            autoComplete="off"
            value={formData.company}
            onChange={handleChange}
            aria-hidden="true"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          {status.message ? <p className={`contact-status ${status.type}`}>{status.message}</p> : null}
        </form>
      </div>
    </section>
  );
}

export default Contact;
