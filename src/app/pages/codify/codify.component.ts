import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-codify',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './codify.component.html',
  styleUrl: './codify.component.scss'
})
export class CodifyComponent {
  modules = [
    { icon: '📊', title: 'Brokerage Management', desc: 'Full-featured brokerage operations with account management, commissions, and settlement workflows.' },
    { icon: '📈', title: 'Trading Platform', desc: 'Real-time order management, trade execution, market data integration, and blotter views.' },
    { icon: '🧾', title: 'Client Onboarding', desc: 'Digital KYC, AML screening, document collection, and account opening workflows.' },
    { icon: '👥', title: 'CRM & Relationship', desc: 'Client relationship management, advisor tools, interaction tracking, and communication logs.' },
    { icon: '💼', title: 'Portfolio Management', desc: 'Portfolio construction, rebalancing, P&L tracking, risk metrics, and client reporting.' },
    { icon: '🏦', title: 'Wealthtech Modules', desc: 'Goal-based planning, model portfolios, robo-advisory integration, and fee management.' }
  ];

  benefits = [
    { icon: '⚡', title: 'Rapid Deployment', desc: 'Modular architecture allows you to go live with core modules in weeks, not months.' },
    { icon: '🔒', title: 'Compliance-Aligned Architecture', desc: 'Designed to support operational and governance requirements of regulated financial environments — audit trails, RBAC, workflow approvals, and transaction traceability built in.' },
    { icon: '🔗', title: 'Integration-First', desc: 'Open APIs for connectivity to custodians, market data providers, and third-party systems.' },
    { icon: '📱', title: 'Multi-Channel', desc: 'Web, mobile, and advisor portals from a single platform. Consistent experience everywhere.' }
  ];
}
