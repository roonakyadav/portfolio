import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActionButtons from '@/components/ActionButtons';

describe('ActionButtons', () => {
  it('renders the VIEW RESUME button with correct PDF destination and attributes', () => {
    render(<ActionButtons />);

    const resumeLinks = screen.getAllByRole('link', { name: /view resume/i });
    expect(resumeLinks.length).toBeGreaterThan(0);

    const resumeLink = resumeLinks[0];
    expect(resumeLink).toHaveAttribute('href', '/ronak-yadav-resume.pdf');
    expect(resumeLink).toHaveAttribute('target', '_blank');
    expect(resumeLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(resumeLink).not.toHaveAttribute('download');
  });

  it('renders GET IN TOUCH and VIEW GITHUB buttons correctly', () => {
    render(<ActionButtons />);

    const contactLinks = screen.getAllByRole('link', { name: /get in touch/i });
    expect(contactLinks[0]).toHaveAttribute('href', '#contact');

    const githubLinks = screen.getAllByRole('link', { name: /view github/i });
    expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/roonakyadav');
    expect(githubLinks[0]).toHaveAttribute('target', '_blank');
  });
});
