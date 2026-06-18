export interface Hymn {
  title: string;
  english: string;
  latin: string;
}

export interface Prayer {
  title: string;
  english: string;
  latin: string;
}

export const hymns: Record<string, Hymn> = {
  'O Salutaris Hostia': {
    title: 'O Salutaris Hostia',
    english: 'O saving Victim, opening wide\nThe gate of heaven to man below;\nOur foes press hard on every side;\nThine aid supply, thy strength bestow.\n\nTo thy great name be endless praise,\nImmortal Godhead, one in three;\nO grant us endless length of days\nIn our true native land with thee. Amen.',
    latin: 'O salutaris Hostia,\nQuae caeli pandis ostium:\nBella premunt hostilia,\nDa robur, fer auxilium.\n\nUni trinoque Domino\nSit sempiterna gloria:\nQui vitam sine termino\nNobis donet in patria. Amen.'
  },
  'Tantum Ergo': {
    title: 'Tantum Ergo',
    english: 'Down in adoration falling,\nLo! the sacred Host we hail;\nLo! o\'er ancient forms departing,\nNewer rites of grace prevail;\nFaith for all defects supplying,\nWhere the feeble senses fail.\n\nTo the everlasting Father,\nAnd the Son who reigns on high,\nWith the Holy Ghost proceeding\nForth from each eternally,\nBe salvation, honor, blessing,\nMight and endless majesty. Amen.',
    latin: 'Tantum ergo Sacramentum\nVeneremur cernui:\nEt antiquum documentum\nNovo cedat ritui:\nPraestet fides supplementum\nSensuum defectui.\n\nGenitori, Genitoque\nLaus et iubilatio,\nSalus, honor, virtus quoque\nSit et benedictio:\nProcedenti ab utroque\nCompar sit laudatio. Amen.'
  }
};

export const prayers: Record<string, Prayer> = {
  'Prayer': {
    title: 'Prayer',
    english: 'Lord Jesus Christ, you gave us the Eucharist as the memorial of your suffering and death. May our worship of this sacrament of your body and blood help us to experience the salvation you won for us and the peace of the kingdom where you live with the Father and the Holy Spirit, one God, for ever and ever. Amen.',
    latin: 'Domine Iesu Christe, qui in hoc mirabili sacramento passionis tuae memoriam reliquisti, tribue nobis, quaesumus, ita corporis et sanguinis tui sacra mysteria venerari, ut redemptionis tuae fructum in nobis iugiter sentiamus. Qui vivis et regnas in saecula saeculorum. Amen.'
  },
  'Divine Praises': {
    title: 'Divine Praises',
    english: 'Blessed be God.\nBlessed be His Holy Name.\nBlessed be Jesus Christ, true God and true Man.\nBlessed be the Name of Jesus.\nBlessed be His Most Sacred Heart.\nBlessed be His Most Precious Blood.\nBlessed be Jesus in the Most Holy Sacrament of the Altar.\nBlessed be the Holy Spirit, the Paraclete.\nBlessed be the great Mother of God, Mary most Holy.\nBlessed be her Holy and Immaculate Conception.\nBlessed be her Glorious Assumption.\nBlessed be the Name of Mary, Virgin and Mother.\nBlessed be St. Joseph, her most chaste Spouse.\nBlessed be God in His Angels and in His Saints.',
    latin: 'Benedictus Deus.\nBenedictum Nomen Sanctum eius.\nBenedictus Iesus Christus, verus Deus et verus homo.\nBenedictum Nomen Iesu.\nBenedictum Cor eius sacratissimum.\nBenedictus Sanguis eius pretiosissimus.\nBenedictus Iesus in sanctissimo altaris Sacramento.\nBenedictus Spiritus Sanctus Paraclitus.\nBenedicta excelsa Mater Dei Maria sanctissima.\nBenedicta sancta eius et immaculata Conceptio.\nBenedicta eius gloriosa Assumptio.\nBenedictum nomen Mariae Virginis et Matris.\nBenedictus sanctus Ioseph, eius castissimus Sponsus.\nBenedictus Deus in Angelis suis et in Sanctis suis.'
  },
  'Prayer of St. Thomas Aquinas': {
    title: 'Prayer of St. Thomas Aquinas',
    english: 'O God, who in this wonderful Sacrament left us a memorial of Your Passion, grant us, we pray, so to revere the sacred mysteries of Your Body and Blood that we may always experience in ourselves the fruits of Your redemption.',
    latin: 'Deus, qui nobis sub sacramento mirabili passionis tuae memoriam reliquisti, tribue nobis, quaesumus, ita nos corporis et sanguinis tui sacra mysteria venerari, ut redemptionis tuae fructum in nobis iugiter sentiamus.'
  }
};

