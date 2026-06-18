export interface SacramentInfo {
  name: string;
  description: string;
  requirements: string[];
}

export const SACRAMENTS: SacramentInfo[] = [
  {
    name: 'Baptism',
    description: 'The sacrament of initiation into the Christian faith.',
    requirements: [
      'Parents must be registered parishioners',
      'Baptism preparation class attendance required',
      'Godparents must be practicing Catholics',
      'Birth certificate required',
      'Contact parish office at least 2 months in advance',
    ],
  },
  {
    name: 'First Communion',
    description: 'Receiving the Body and Blood of Christ for the first time.',
    requirements: [
      'Child must be at least 7 years old',
      'Completion of religious education program',
      'Regular Mass attendance',
      'Parent/guardian meeting required',
    ],
  },
  {
    name: 'Confirmation',
    description: 'The sacrament that completes the grace of Baptism.',
    requirements: [
      'Completion of Confirmation preparation program',
      'Regular Mass attendance',
      'Sponsor must be a confirmed Catholic',
      'Active participation in parish life',
    ],
  },
  {
    name: 'Marriage',
    description: 'The sacrament of matrimony, a lifelong covenant.',
    requirements: [
      'Contact parish office at least 6 months in advance',
      'Pre-marital preparation program (Pre-Cana)',
      'Freedom to marry documentation',
      'Baptism and Confirmation certificates',
      'Marriage preparation meetings with priest',
    ],
  },
  {
    name: 'Reconciliation (Confession)',
    description: "The sacrament of God's mercy and forgiveness.",
    requirements: [
      'Regular confession schedule available',
      'No appointment needed during scheduled times',
      'For special circumstances, contact parish office',
    ],
  },
  {
    name: 'Anointing of the Sick',
    description: 'The sacrament of healing for those who are ill.',
    requirements: [
      'Available for those who are seriously ill or elderly',
      'Contact parish office to arrange',
      'Can be administered at home or hospital',
    ],
  },
];

