import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './software.component.html',
  styleUrl: './software.component.scss'
})
export class SoftwareComponent {
  services = [
    { icon: '🖥️', title: 'Frontend Development', desc: 'High-performance Angular and React applications with responsive design and excellent UX.' },
    { icon: '⚡', title: 'Backend & APIs', desc: 'Scalable REST and GraphQL APIs, microservices, and cloud-native architectures.' },
    { icon: '☁️', title: 'Cloud & DevOps', desc: 'AWS, GCP, and Azure deployment. CI/CD pipelines, containerisation, and infrastructure-as-code.' },
    { icon: '🤖', title: 'AI Integration', desc: 'LLM-powered workflows, intelligent automation, and AI-enabled features integrated into your stack.' },
    { icon: '🔒', title: 'Security & Compliance', desc: 'Enterprise-grade security, data encryption, audit logging, and regulatory compliance.' },
    { icon: '📊', title: 'Business Intelligence', desc: 'Custom dashboards, reporting, analytics pipelines and data visualisation for decision-makers.' }
  ];

  process = [
    { step: '01', title: 'Discover', desc: 'Deep-dive into your business, goals, users, and constraints. Define scope and success metrics.' },
    { step: '02', title: 'Design', desc: 'Architecture, UX wireframes, and technical specifications. Reviewed and approved before build starts.' },
    { step: '03', title: 'Develop', desc: 'Agile sprints with fortnightly demos. Full visibility into progress, testing, and quality.' },
    { step: '04', title: 'Deploy', desc: 'Production launch, monitoring, and ongoing support. We stay engaged post-delivery.' }
  ];

  tech = ['Angular 17+', 'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'GraphQL'];
}
