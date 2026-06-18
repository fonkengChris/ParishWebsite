export interface ConfessionStep {
  number: number;
  title: string;
  description: string;
}

export interface ConfessionPrayer {
  title: string;
  english: string;
  latin?: string;
}

export const confessionSteps: ConfessionStep[] = [
  {
    number: 1,
    title: 'Examination of Conscience',
    description: 'Before going to confession, take time to prayerfully examine your conscience. Reflect on your thoughts, words, and actions since your last confession. Consider the Ten Commandments and the teachings of the Church.'
  },
  {
    number: 2,
    title: 'Enter the Confessional',
    description: 'Enter the confessional or reconciliation room. You may choose to confess face-to-face or behind a screen. Both are valid forms of the sacrament.'
  },
  {
    number: 3,
    title: 'Begin with the Sign of the Cross',
    description: 'Make the Sign of the Cross. The priest will also make the Sign of the Cross and may say: "May God, who has enlightened every heart, help you to know your sins and trust in his mercy."'
  },
  {
    number: 4,
    title: 'Confess Your Sins',
    description: 'Confess your sins clearly and honestly. Begin by saying how long it has been since your last confession, then confess all mortal sins (sins that are grave matter, committed with full knowledge, and with deliberate consent). You may also confess venial sins. Be specific but brief.'
  },
  {
    number: 5,
    title: 'Listen to the Priest\'s Counsel',
    description: 'The priest may offer you spiritual advice and guidance. Listen attentively to his counsel.'
  },
  {
    number: 6,
    title: 'Receive Your Penance',
    description: 'The priest will assign you a penance, which is usually prayers or acts of charity. This penance helps to repair the harm caused by sin and strengthens your resolve to avoid sin in the future.'
  },
  {
    number: 7,
    title: 'Pray the Act of Contrition',
    description: 'Pray the Act of Contrition, expressing your sorrow for your sins and your resolve to sin no more. You may use your own words or a traditional formula.'
  },
  {
    number: 8,
    title: 'Receive Absolution',
    description: 'The priest will extend his hands over your head (or at least extend his right hand) and pray the prayer of absolution. Through this prayer, God grants you forgiveness of your sins through the ministry of the Church.'
  },
  {
    number: 9,
    title: 'Give Thanks',
    description: 'After receiving absolution, thank God for His mercy and forgiveness. The priest may say: "Give thanks to the Lord, for He is good." You respond: "His mercy endures forever."'
  },
  {
    number: 10,
    title: 'Complete Your Penance',
    description: 'After leaving the confessional, complete the penance assigned by the priest as soon as possible. This is an important part of the sacrament.'
  }
];

export const confessionPrayers: Record<string, ConfessionPrayer> = {
  'Act of Contrition (Traditional)': {
    title: 'Act of Contrition (Traditional)',
    english: 'O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen.',
    latin: 'Deus meus, ex toto corde paenitet me omnium meorum peccatorum, eaque detestor, quia peccando, non solum poenas a te iuste statutas promeritus sum, sed praesertim quia offendi te, summum bonum, ac dignum qui super omnia diligaris. Ideo firmiter propono, adiuvante gratia tua, de cetero me non peccaturum peccandique occasiones proximas fugiturum. Amen.'
  },
  'Act of Contrition (Modern)': {
    title: 'Act of Contrition (Modern)',
    english: 'My God, I am sorry for my sins with all my heart. In choosing to do wrong and failing to do good, I have sinned against You whom I should love above all things. I firmly intend, with Your help, to do penance, to sin no more, and to avoid whatever leads me to sin. Our Savior Jesus Christ suffered and died for us. In His name, my God, have mercy. Amen.'
  },
  'Prayer Before Confession': {
    title: 'Prayer Before Confession',
    english: 'Come, Holy Spirit, into my soul. Enlighten my mind, that I may know the sins I have committed. Give me the courage to confess them honestly and the grace to be truly sorry for them. Help me to resolve to avoid sin in the future. Amen.'
  },
  'Prayer After Confession': {
    title: 'Prayer After Confession',
    english: 'Thank you, Lord Jesus, for the gift of Your mercy and forgiveness. Help me to live as a new creation, free from sin and filled with Your love. Give me the strength to resist temptation and to follow Your will. May Your grace guide me always. Amen.'
  }
};

