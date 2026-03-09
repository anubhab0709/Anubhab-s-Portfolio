export const personalInfo = {
  name: 'Anubhab Bhattacharjee',
  shortName: 'A.B',
  location: 'Kolkata, India',
  role: 'Full Stack Developer',
  email: 'anubhabbhatt.eng@gmail.com',
  phone: '+91 8617569139',
  headline:
    'Full Stack Developer and MERN Stack Engineer building scalable web products with clean architecture.',
  about: [
    "I am Anubhab Bhattacharjee, a Full Stack Web Developer from Kolkata, currently pursuing B.Tech in CSE at Brainware University (CGPA 8.80).",
    'I enjoy transforming complex real-world problems into practical software systems that are efficient, maintainable, and user-friendly.'
  ],
  stats: [
    { value: '8.80', label: 'CGPA · B.Tech' },
    { value: '3+', label: 'Real Projects' },
    { value: '3', label: 'Certifications' }
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/your_username' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your_profile' },
    { label: 'Instagram', href: 'https://instagram.com/your_handle' },
    { label: 'WhatsApp', href: 'https://wa.me/918617569139' }
  ]
};

export const skills = [
  {
    title: 'Frontend Development',
    description:
      'Building fast, responsive interfaces with reusable React components and clean styling architecture.',
    tags: ['React.js', 'JavaScript', 'HTML', 'CSS']
  },
  {
    title: 'Backend Engineering',
    description:
      'Designing REST APIs and scalable services with Node.js and Express, focused on clean code and reliability.',
    tags: ['Node.js', 'Express.js', 'REST API', 'MongoDB']
  },
  {
    title: 'AI and ML Integration',
    description:
      'Applying ML models to products, including deepfake detection workflows with backend integration.',
    tags: ['TensorFlow', 'Python', 'Django', 'Model Integration']
  },
  {
    title: 'Database and System Design',
    description:
      'Planning schemas and data flow for concurrent systems using SQL and NoSQL approaches.',
    tags: ['MongoDB', 'SQL', 'DBMS', 'Schema Design']
  },
  {
    title: 'Developer Tooling',
    description:
      'Improving workflow with modern version control and debugging practices in complex repositories.',
    tags: ['Git', 'GitHub', 'VS Code', 'Postman']
  },
  {
    title: 'Computer Science Foundation',
    description:
      'Strong fundamentals in OOP, data structures, operating systems, and computer networks.',
    tags: ['OOP', 'DSA', 'OS', 'Networking']
  }
];

export const projects = [
  {
    id: 1,
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
    liveDemo: '#',
    link: '#'
  },
  {
    id: 2,
    category: ['mern', 'fullstack'],
    title: 'PharmaCare - Inventory Tracker',
    period: 'Oct 2025 - Nov 2025',
    summary:
      'Created a pharmacy inventory system with low-stock and expiry alerts for operational efficiency.',
    about:
      'PharmaCare streamlines stock monitoring for pharmacies with product-level inventory visibility, threshold alerts, and expiry-aware operations. The project is designed to reduce manual tracking and improve replenishment decisions.',
    metrics: ['500+ SKUs tracked', 'Manual effort reduced by 40%'],
    stack: ['React.js', 'Node.js', 'MongoDB', 'MERN'],
    photos: [
      'https://picsum.photos/seed/pharmacare-overview/1200/800',
      'https://picsum.photos/seed/pharmacare-stock/1200/800',
      'https://picsum.photos/seed/pharmacare-alerts/1200/800'
    ],
    github: 'https://github.com/your_username/pharmacare',
    liveDemo: '#',
    link: '#'
  },
  {
    id: 3,
    category: ['ml', 'fullstack'],
    title: 'Deepfake Detection Platform',
    period: 'Academic Project',
    summary:
      'Integrated TensorFlow-based detection models with backend APIs for practical deepfake content screening.',
    about:
      'This platform combines machine learning inference with web workflows to evaluate uploaded media for deepfake signals. It emphasizes practical API integration, prediction explainability, and usable feedback for moderation use cases.',
    metrics: ['Model-driven analysis workflow', 'Backend API integration'],
    stack: ['Python', 'TensorFlow', 'Django', 'REST'],
    photos: [
      'https://picsum.photos/seed/deepfake-home/1200/800',
      'https://picsum.photos/seed/deepfake-analysis/1200/800',
      'https://picsum.photos/seed/deepfake-results/1200/800'
    ],
    github: 'https://github.com/your_username/deepfake-detection-platform',
    liveDemo: '#',
    link: '#'
  }
];

export const experience = [
  {
    title: 'Full Stack Development Projects',
    company: 'Independent / Academic',
    period: '2024 - Present',
    description:
      'Designed and implemented complete web solutions with frontend, backend, and database layers for real use cases.',
    certificate: {
      title: 'Industrial Trainee Certificate',
      file: '/certificates/industrial-trainee.jpeg',
      type: 'image'
    }
  },
  {
    title: 'Backend API Engineering',
    company: 'MERN Workstreams',
    period: '2024 - 2025',
    description:
      'Developed modular APIs and business logic with Express and MongoDB, with focus on reliability and maintainability.',
    certificate: {
      title: 'MyJob Grow Internship Certificate',
      file: '/certificates/myjob-grow.pdf',
      type: 'pdf'
    }
  },
  {
    title: 'Machine Learning Application',
    company: 'Deepfake Detection Initiative',
    period: '2025',
    description:
      'Connected ML inference pipeline with REST endpoints and product workflows for practical deployment scenarios.',
    certificate: {
      title: 'MyJob Grow Internship Certificate',
      file: '/certificates/myjob-grow.pdf',
      type: 'pdf'
    }
  }
];

export const achievements = [
  'Built and shipped multiple full stack projects with measurable performance impact.',
  'Implemented booking and inventory logic for real-world operational workflows.',
  'Completed industry-recognized certifications aligned with development and cloud practices.'
];

export const education = [
  {
    degree: 'B.Tech in Computer Science and Engineering',
    institute: 'Brainware University',
    period: '2022 - 2026',
    score: 'CGPA 8.80'
  },
  {
    degree: 'Higher Secondary',
    institute: 'WBCHSE',
    period: '2020 - 2022',
    score: 'Science Stream'
  }
];

export const certifications = [
  'Google Cloud Computing Foundations',
  'AWS Cloud Foundation',
  'AI and ML Fundamentals'
];

export const languages = [
  { name: 'English', level: 'Professional' },
  { name: 'Hindi', level: 'Fluent' },
  { name: 'Bengali', level: 'Native' }
];
