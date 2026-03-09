import { SiteContent } from '../models/SiteContent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminUpdateContentSchema } from '../validators/admin.validators.js';

const defaultContent = {
  projects: [
    {
      id: 'trimtime',
      category: ['mern', 'fullstack'],
      title: 'TrimTime - Salon Booking Platform',
      period: 'Jan 2025 - Present',
      summary:
        'Built conflict-free slot booking logic and multi-dashboard workflow to reduce double-booking and improve appointment flow.',
      about:
        'TrimTime is a role-based salon platform with dedicated dashboards for customers, barbers, and admins. The system focuses on reliable slot management, smooth appointment transitions, and clean service workflows to reduce operational friction.',
      metrics: ['Double booking reduced by 60%', 'Appointment flow improved by 20%'],
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'MERN'],
      photos: [
        'https://picsum.photos/seed/trimtime-dashboard/1200/800',
        'https://picsum.photos/seed/trimtime-booking/1200/800',
        'https://picsum.photos/seed/trimtime-admin/1200/800'
      ],
      github: 'https://github.com/your_username/trimtime',
      liveDemo: 'https://example.com/trimtime',
      link: 'https://example.com/trimtime'
    }
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/your_username' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your_profile' },
    { label: 'Instagram', href: 'https://instagram.com/your_handle' },
    { label: 'WhatsApp', href: 'https://wa.me/918617569139' }
  ],
  resumes: [{ label: 'Primary Resume', href: 'https://example.com/cv.pdf', isPrimary: true }]
};

async function getOrCreateContent() {
  const existing = await SiteContent.findOne({ singletonKey: 'portfolio' }).lean();
  if (existing) {
    return existing;
  }

  return SiteContent.create({
    singletonKey: 'portfolio',
    ...defaultContent
  });
}

export const getPublicContent = asyncHandler(async (_req, res) => {
  const content = await getOrCreateContent();

  res.status(200).json({
    success: true,
    data: {
      projects: content.projects,
      socialLinks: content.socialLinks,
      resumes: content.resumes,
      updatedAt: content.updatedAt
    }
  });
});

export const getAdminContent = asyncHandler(async (_req, res) => {
  const content = await getOrCreateContent();

  res.status(200).json({
    success: true,
    data: content
  });
});

export const updateAdminContent = asyncHandler(async (req, res) => {
  const payload = adminUpdateContentSchema.parse(req.body);

  const updated = await SiteContent.findOneAndUpdate(
    { singletonKey: 'portfolio' },
    {
      singletonKey: 'portfolio',
      projects: payload.projects,
      socialLinks: payload.socialLinks,
      resumes: payload.resumes
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  res.status(200).json({
    success: true,
    message: 'Portfolio content updated successfully',
    data: updated
  });
});