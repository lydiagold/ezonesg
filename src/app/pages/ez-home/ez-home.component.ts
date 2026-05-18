import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ez-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ez-home.component.html',
  styleUrl: './ez-home.component.scss'
})
export class EzHomeComponent {
  solutions = [
    {
      icon: '⚙️',
      badge: 'Full-Stack',
      color: 'navy',
      title: 'Enterprise Software Development',
      desc: 'Custom Angular, React, API, cloud, and AI-enabled business applications built for performance, security, and scale.',
      link: '/software',
      ctaLabel: 'Explore Software',
      features: ['Angular & React frontends', 'Cloud-native APIs', 'AI & ML integration', 'CI/CD & DevOps']
    },
    {
      icon: '📈',
      badge: 'FinTech',
      color: 'gold',
      title: 'Codify Capital Markets Platform',
      desc: 'Brokerage, trading, onboarding, CRM, portfolio management, and wealthtech solutions for financial institutions.',
      link: '/codify',
      ctaLabel: 'View Platform',
      features: ['Brokerage & trading', 'Client onboarding & KYC', 'Portfolio management', 'Compliance-aligned workflows']
    },
    {
      icon: '💻',
      badge: 'Hardware',
      color: 'slate',
      title: 'JK Infotech Hardware Solutions',
      desc: 'Laptop sales, rentals, refurbished devices, IT support, and corporate device deployment across Singapore.',
      link: '/laptops',
      ctaLabel: 'View Devices',
      features: ['New & refurbished laptops', 'Short & long-term rentals', 'Corporate bulk deployment', 'On-site IT support']
    }
  ];

  aboutPoints = [
    'Singapore-incorporated technology group',
    'End-to-end delivery: design through deployment',
    'Security-first, cloud-native architecture',
    'Cross-industry expertise: fintech, commerce, hardware',
    'Dedicated post-deployment support & maintenance'
  ];

  companyStats = [
    { icon: '🇸🇬', num: 'SG', label: 'Incorporated' },
    { icon: '🚀', num: '4+', label: 'Active Platforms' },
    { icon: '🏢', num: 'B2B', label: 'Enterprise Focus' },
    { icon: '🛡️', num: '100%', label: 'Delivery Commitment' }
  ];

  techStack = [
    { icon: '🅰️', name: 'Angular', tag: 'Frontend' },
    { icon: '⚛️', name: 'React', tag: 'Frontend' },
    { icon: '🟢', name: 'Node.js', tag: 'Backend' },
    { icon: '📘', name: 'TypeScript', tag: 'Language' },
    { icon: '☁️', name: 'AWS', tag: 'Cloud' },
    { icon: '🔌', name: 'REST & GraphQL', tag: 'APIs' },
    { icon: '🤖', name: 'AI Platforms', tag: 'Intelligence' },
    { icon: '🔗', name: 'Enterprise Integrations', tag: 'Middleware' },
    { icon: '🐍', name: 'Python', tag: 'Backend / Data' },
    { icon: '🐘', name: 'PostgreSQL', tag: 'Database' },
    { icon: '🐳', name: 'Docker', tag: 'DevOps' },
    { icon: '⚡', name: 'CI/CD Pipelines', tag: 'Automation' }
  ];

  capabilities = [
    {
      icon: '🔒',
      title: 'Security-First Architecture',
      desc: 'Enterprise-grade security from day one — OAuth2, JWT, RBAC, encryption at rest, and vulnerability scanning built in.'
    },
    {
      icon: '☁️',
      title: 'Cloud-Native Infrastructure',
      desc: 'AWS-hosted, containerised deployments with auto-scaling, load balancing, and 99.9%+ uptime SLAs.'
    },
    {
      icon: '📱',
      title: 'Responsive & Mobile-First',
      desc: 'All platforms designed mobile-first, tested across devices, browsers, and screen sizes for consistent UX.'
    },
    {
      icon: '🔗',
      title: 'Enterprise Integrations',
      desc: 'Seamless integration with ERP, CRM, banking APIs, payment gateways, and any third-party platform you rely on.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      desc: 'Real-time dashboards, custom reporting, and data export capabilities for business intelligence and compliance.'
    },
    {
      icon: '🤝',
      title: 'Long-Term Partnership',
      desc: 'Beyond launch — maintenance, support, upgrades, and strategic technology advisory on an ongoing basis.'
    }
  ];
}
