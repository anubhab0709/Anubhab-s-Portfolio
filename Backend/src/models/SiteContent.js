import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    href: { type: String, required: true, trim: true, maxlength: 2048 }
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    href: { type: String, required: true, trim: true, maxlength: 2048 },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    period: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    about: { type: String, required: true, trim: true, maxlength: 4000 },
    category: [{ type: String, trim: true, maxlength: 60 }],
    metrics: [{ type: String, trim: true, maxlength: 160 }],
    stack: [{ type: String, trim: true, maxlength: 80 }],
    photos: [{ type: String, trim: true, maxlength: 2048 }],
    github: { type: String, required: true, trim: true, maxlength: 2048 },
    liveDemo: { type: String, required: true, trim: true, maxlength: 2048 },
    link: { type: String, required: true, trim: true, maxlength: 2048 }
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: 'portfolio' },
    projects: { type: [projectSchema], default: [] },
    socialLinks: { type: [linkSchema], default: [] },
    resumes: { type: [resumeSchema], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);