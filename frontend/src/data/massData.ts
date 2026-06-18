export interface Dialogue {
  title: string;
  english: {
    priest: string;
    congregation: string;
  };
  latin: {
    priest: string;
    congregation: string;
  };
}

export interface Prayer {
  title: string;
  english: string;
  latin: string;
}

export interface MassSection {
  title: string;
  items: Array<{
    number: string;
    title: string;
    type: 'simple' | 'dialogue' | 'prayer';
    dialogueKey?: string;
    prayerKey?: string;
  }>;
}

// Ordinary Form (based on MCFL.pdf)
export const ordinaryDialogues: Record<string, Dialogue> = {
  'Greeting': {
    title: 'Greeting',
    english: {
      priest: 'The grace of our Lord Jesus Christ, and the love of God, and the communion of the Holy Spirit be with you all. (or) Grace to you and peace from God our Father and the Lord Jesus Christ. (or) The Lord be with you.',
      congregation: 'And with your spirit.'
    },
    latin: {
      priest: 'Gratia Domini nostri Iesu Christi, et caritas Dei, et communicatio Sancti Spiritus sit cum omnibus vobis. (or) Gratia vobis et pax a Deo Patre nostro et Domino Iesu Christo. (or) Dominus vobiscum.',
      congregation: 'Et cum spiritu tuo.'
    }
  },
  'Penitential Act': {
    title: 'Penitential Act',
    english: {
      priest: 'To prepare ourselves to celebrate these sacred mysteries, let us call to mind our sins and ask God for forgiveness.',
      congregation: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.'
    },
    latin: {
      priest: 'Confiteor Deo omnipotenti, et vobis, fratres, quia peccavi nimis cogitatione, verbo, opere et omissione: mea culpa, mea culpa, mea maxima culpa. Ideo precor beatam Mariam semper Virginem, omnes Angelos et Sanctos, et vos, fratres, orare pro me ad Dominum Deum nostrum.',
      congregation: 'Misereatur nostri omnipotens Deus et, dimissis peccatis nostris, perducat nos ad vitam aeternam.'
    }
  },
  'Gospel Acclamation': {
    title: 'Gospel Acclamation',
    english: {
      priest: 'A reading from the holy Gospel according to N.',
      congregation: 'Glory to you, O Lord. ... The Gospel of the Lord. ... Praise to you, Lord Jesus Christ.'
    },
    latin: {
      priest: 'Lectio sancti Evangelii secundum N.',
      congregation: 'Gloria tibi, Domine. ... Verbum Domini. ... Laus tibi, Christe.'
    }
  },
  'Preface Dialogue': {
    title: 'Preface Dialogue',
    english: {
      priest: 'The Lord be with you. ... Lift up your hearts. ... Let us give thanks to the Lord our God.',
      congregation: 'And with your spirit. ... We lift them up to the Lord. ... It is right and just.'
    },
    latin: {
      priest: 'Dominus vobiscum. ... Sursum corda. ... Gratias agamus Domino Deo nostro.',
      congregation: 'Et cum spiritu tuo. ... Habemus ad Dominum. ... Dignum et iustum est.'
    }
  },
  'Memorial Acclamation': {
    title: 'Memorial Acclamation',
    english: {
      priest: 'The mystery of faith.',
      congregation: 'We proclaim your Death, O Lord, and profess your Resurrection until you come again. (or) When we eat this Bread and drink this Cup, we proclaim your Death, O Lord, until you come again. (or) Save us, Saviour of the world, for by your Cross and Resurrection you have set us free.'
    },
    latin: {
      priest: 'Mysterium fidei.',
      congregation: 'Mortem tuam annuntiamus, Domine, et tuam resurrectionem confitemur, donec venias. (or) Quotiescumque manducamus panem hunc et calicem bibimus, tuam mortem annuntiamus, Domine, donec venias. (or) Salvos nos fac, Christe Redemptor, per crucem et resurrectionem tuam liberasti nos.'
    }
  },
  'Sign of Peace': {
    title: 'Sign of Peace',
    english: {
      priest: 'The peace of the Lord be with you always.',
      congregation: 'And with your spirit.'
    },
    latin: {
      priest: 'Pax Domini sit semper vobiscum.',
      congregation: 'Et cum spiritu tuo.'
    }
  },
  'Dismissal': {
    title: 'Dismissal',
    english: {
      priest: 'Go forth, the Mass is ended. (or) Go and announce the Gospel of the Lord. (or) Go in peace, glorifying the Lord by your life.',
      congregation: 'Thanks be to God.'
    },
    latin: {
      priest: 'Ite, missa est. (or) Ite ad Evangelium Domini annuntiandum. (or) Ite in pace, glorificando vita vestra Dominum.',
      congregation: 'Deo gratias.'
    }
  }
};

export const ordinaryPrayers: Record<string, Prayer> = {
  'Kyrie': {
    title: 'Kyrie Eleison',
    english: 'Lord, have mercy. (or) Kyrie, eleison. Lord, have mercy. (or) Kyrie, eleison. Christ, have mercy. (or) Christe, eleison. Christ, have mercy. (or) Christe, eleison. Lord, have mercy. (or) Kyrie, eleison. Lord, have mercy. (or) Kyrie, eleison.',
    latin: 'Kyrie, eleison. Kyrie, eleison. Christe, eleison. Christe, eleison. Kyrie, eleison. Kyrie, eleison.'
  },
  'Gloria': {
    title: 'Gloria',
    english: 'Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you, we give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father. Lord Jesus Christ, Only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father, have mercy on us. For you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen.',
    latin: 'Gloria in excelsis Deo et in terra pax hominibus bonae voluntatis. Laudamus te, benedicimus te, adoramus te, glorificamus te, gratias agimus tibi propter magnam gloriam tuam, Domine Deus, Rex caelestis, Deus Pater omnipotens. Domine Fili unigenite, Iesu Christe, Domine Deus, Agnus Dei, Filius Patris, qui tollis peccata mundi, miserere nobis; qui tollis peccata mundi, suscipe deprecationem nostram. Qui sedes ad dexteram Patris, miserere nobis. Quoniam tu solus Sanctus, tu solus Dominus, tu solus Altissimus, Iesu Christe, cum Sancto Spiritu in gloria Dei Patris. Amen.'
  },
  'Creed': {
    title: 'Nicene Creed',
    english: 'I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.',
    latin: 'Credo in unum Deum, Patrem omnipotentem, factorem caeli et terrae, visibilium omnium et invisibilium. Et in unum Dominum Iesum Christum, Filium Dei unigenitum, et ex Patre natum ante omnia saecula. Deum de Deo, Lumen de Lumine, Deum verum de Deo vero, genitum non factum, consubstantialem Patri; per quem omnia facta sunt. Qui propter nos homines et propter nostram salutem descendit de caelis. Et incarnatus est de Spiritu Sancto ex Maria Virgine, et homo factus est. Crucifixus etiam pro nobis sub Pontio Pilato, passus et sepultus est, et resurrexit tertia die, secundum Scripturas, et ascendit in caelum, sedet ad dexteram Patris. Et iterum venturus est cum gloria, iudicare vivos et mortuos, cuius regni non erit finis. Et in Spiritum Sanctum, Dominum et vivificantem, qui ex Patre Filioque procedit. Qui cum Patre et Filio simul adoratur et conglorificatur: qui locutus est per prophetas. Et unam, sanctam, catholicam et apostolicam Ecclesiam. Confiteor unum baptisma in remissionem peccatorum. Et exspecto resurrectionem mortuorum, et vitam venturi saeculi. Amen.'
  },
  'Our Father': {
    title: 'Our Father',
    english: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Deliver us, Lord, we pray, from every evil, graciously grant peace in our days, that, by the help of your mercy, we may be always free from sin and safe from all distress, as we await the blessed hope and the coming of our Saviour, Jesus Christ. For the kingdom, the power and the glory are yours now and for ever.',
    latin: 'Pater noster, qui es in caelis, sanctificetur nomen tuum; adveniat regnum tuum; fiat voluntas tua, sicut in caelo et in terra. Panem nostrum cotidianum da nobis hodie; et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris; et ne nos inducas in tentationem, sed libera nos a malo. Libera nos, quaesumus, Domine, ab omnibus malis, da propitius pacem in diebus nostris, ut, ope misericordiae tuae adiuti, et a peccato simus semper liberi et ab omni perturbatione securi, exspectantes beatam spem et adventum Salvatoris nostri Iesu Christi. Quia tuum est regnum et potestas et gloria in saecula.'
  },
  'Agnus Dei': {
    title: 'Agnus Dei',
    english: 'Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, grant us peace.',
    latin: 'Agnus Dei, qui tollis peccata mundi, miserere nobis. Agnus Dei, qui tollis peccata mundi, miserere nobis. Agnus Dei, qui tollis peccata mundi, dona nobis pacem.'
  },
  'Sanctus': {
    title: 'Sanctus',
    english: 'Holy, Holy, Holy Lord God of hosts. Heaven and earth are full of your glory. Hosanna in the highest. Blessed is he who comes in the name of the Lord. Hosanna in the highest.',
    latin: 'Sanctus, Sanctus, Sanctus Dominus Deus Sabaoth. Pleni sunt caeli et terra gloria tua. Hosanna in excelsis. Benedictus qui venit in nomine Domini. Hosanna in excelsis.'
  },
  'Final Blessing': {
    title: 'Final Blessing',
    english: 'May almighty God bless you: the Father, and the Son, and the Holy Spirit. Amen.',
    latin: 'Benedicat vos omnipotens Deus, Pater, et Filius, et Spiritus Sanctus. Amen.'
  }
};

// Extraordinary Form (based on 1962 Missal)
export const extraordinaryDialogues: Record<string, Dialogue> = {
  'Greeting': {
    title: 'Greeting',
    english: {
      priest: 'In the name of the Father, and of the Son, and of the Holy Ghost. Amen.',
      congregation: ''
    },
    latin: {
      priest: 'In nomine Patris, et Filii, et Spiritus Sancti. Amen.',
      congregation: ''
    }
  },
  'Confiteor': {
    title: 'Confiteor',
    english: {
      priest: 'I confess to almighty God, to blessed Mary ever Virgin, to blessed Michael the Archangel, to blessed John the Baptist, to the holy Apostles Peter and Paul, and to all the Saints, that I have sinned exceedingly in thought, word, and deed, through my fault, through my fault, through my most grievous fault. Therefore I beseech blessed Mary ever Virgin, blessed Michael the Archangel, blessed John the Baptist, the holy Apostles Peter and Paul, and all the Saints, to pray to the Lord our God for me.',
      congregation: 'May almighty God have mercy upon you, forgive you your sins, and bring you to life everlasting. Amen. May the almighty and merciful Lord grant us pardon, absolution, and remission of our sins. Amen.'
    },
    latin: {
      priest: 'Confiteor Deo omnipotenti, beatae Mariae semper Virgini, beato Michaeli Archangelo, beato Ioanni Baptistae, sanctis Apostolis Petro et Paulo, omnibus Sanctis, et tibi, pater: quia peccavi nimis cogitatione, verbo et opere: mea culpa, mea culpa, mea maxima culpa. Ideo precor beatam Mariam semper Virginem, beatum Michaelem Archangelum, beatum Ioannem Baptistam, sanctos Apostolos Petrum et Paulum, omnes Sanctos, et te, pater, orare pro me ad Dominum Deum nostrum.',
      congregation: 'Misereatur tui omnipotens Deus, et, dimissis peccatis tuis, perducat te ad vitam aeternam. Amen. Indulgentiam, absolutionem, et remissionem peccatorum nostrorum tribuat nobis omnipotens et misericors Dominus. Amen.'
    }
  },
  'Gospel': {
    title: 'Gospel',
    english: {
      priest: 'The Lord be with you. ... A reading from the holy Gospel according to N. ... Glory be to Thee, O Lord. ... The continuation of the holy Gospel according to N. ... Praise be to Thee, O Christ.',
      congregation: 'And with thy spirit. ... Glory be to Thee, O Lord. ... Praise be to Thee, O Christ.'
    },
    latin: {
      priest: 'Dominus vobiscum. ... Sequentia sancti Evangelii secundum N. ... Gloria tibi, Domine. ... Initium sancti Evangelii secundum N. ... Laus tibi, Christe.',
      congregation: 'Et cum spiritu tuo. ... Gloria tibi, Domine. ... Laus tibi, Christe.'
    }
  },
  'Preface': {
    title: 'Preface',
    english: {
      priest: 'The Lord be with you. ... Lift up your hearts. ... Let us give thanks to the Lord our God. ... It is truly meet and just, right and for our salvation, that we should at all times, and in all places, give thanks unto Thee, O holy Lord, Father almighty, everlasting God.',
      congregation: 'And with thy spirit. ... We have lifted them up unto the Lord. ... It is meet and just.'
    },
    latin: {
      priest: 'Dominus vobiscum. ... Sursum corda. ... Gratias agamus Domino Deo nostro. ... Vere dignum et iustum est, aequum et salutare, nos tibi semper et ubique gratias agere: Domine, sancte Pater, omnipotens aeterne Deus.',
      congregation: 'Et cum spiritu tuo. ... Habemus ad Dominum. ... Dignum et iustum est.'
    }
  },
  'Pax Domini': {
    title: 'Pax Domini',
    english: {
      priest: 'The peace of the Lord be always with you.',
      congregation: 'And with thy spirit.'
    },
    latin: {
      priest: 'Pax Domini sit semper vobiscum.',
      congregation: 'Et cum spiritu tuo.'
    }
  },
  'Ite Missa Est': {
    title: 'Ite Missa Est',
    english: {
      priest: 'Go, the Mass is ended.',
      congregation: 'Thanks be to God.'
    },
    latin: {
      priest: 'Ite, missa est.',
      congregation: 'Deo gratias.'
    }
  }
};

export const extraordinaryPrayers: Record<string, Prayer> = {
  'Kyrie': {
    title: 'Kyrie Eleison',
    english: 'Lord, have mercy. Christ, have mercy. Lord, have mercy.',
    latin: 'Kyrie, eleison. Christe, eleison. Kyrie, eleison.'
  },
  'Gloria': {
    title: 'Gloria',
    english: 'Glory be to God on high, and on earth peace to men of good will. We praise Thee. We bless Thee. We adore Thee. We glorify Thee. We give Thee thanks for Thy great glory. O Lord God, heavenly King, God the Father almighty. O Lord Jesus Christ, the only-begotten Son. O Lord God, Lamb of God, Son of the Father. Who takest away the sins of the world, have mercy on us. Who takest away the sins of the world, receive our prayer. Who sittest at the right hand of the Father, have mercy on us. For Thou only art holy. Thou only art the Lord. Thou only, O Jesus Christ, art most high. Together with the Holy Ghost, in the glory of God the Father. Amen.',
    latin: 'Gloria in excelsis Deo et in terra pax hominibus bonae voluntatis. Laudamus te. Benedicimus te. Adoramus te. Glorificamus te. Gratias agimus tibi propter magnam gloriam tuam. Domine Deus, Rex caelestis, Deus Pater omnipotens. Domine Fili unigenite, Iesu Christe. Domine Deus, Agnus Dei, Filius Patris. Qui tollis peccata mundi, miserere nobis. Qui tollis peccata mundi, suscipe deprecationem nostram. Qui sedes ad dexteram Patris, miserere nobis. Quoniam tu solus Sanctus. Tu solus Dominus. Tu solus Altissimus, Iesu Christe. Cum Sancto Spiritu in gloria Dei Patris. Amen.'
  },
  'Credo': {
    title: 'Credo',
    english: 'I believe in one God, the Father almighty, Maker of heaven and earth, and of all things visible and invisible. And in one Lord Jesus Christ, the only-begotten Son of God, born of the Father before all ages. God of God, Light of Light, true God of true God, begotten, not made, consubstantial with the Father, by whom all things were made. Who for us men and for our salvation came down from heaven, and was incarnate by the Holy Ghost of the Virgin Mary, and was made man. He was crucified also for us, suffered under Pontius Pilate, and was buried. And the third day He rose again according to the Scriptures. And ascended into heaven, and sitteth at the right hand of the Father. And He shall come again with glory to judge the living and the dead, of whose kingdom there shall be no end. And in the Holy Ghost, the Lord and Giver of life, Who proceedeth from the Father and the Son, Who together with the Father and the Son is adored and glorified, Who spake by the prophets. And in one, holy, Catholic and Apostolic Church. I confess one baptism for the remission of sins. And I look for the resurrection of the dead, and the life of the world to come. Amen.',
    latin: 'Credo in unum Deum, Patrem omnipotentem, factorem caeli et terrae, visibilium omnium et invisibilium. Et in unum Dominum Iesum Christum, Filium Dei unigenitum. Et ex Patre natum ante omnia saecula. Deum de Deo, Lumen de Lumine, Deum verum de Deo vero. Genitum, non factum, consubstantialem Patri: per quem omnia facta sunt. Qui propter nos homines et propter nostram salutem descendit de caelis. Et incarnatus est de Spiritu Sancto ex Maria Virgine: Et homo factus est. Crucifixus etiam pro nobis: sub Pontio Pilato passus et sepultus est. Et resurrexit tertia die, secundum Scripturas. Et ascendit in caelum: sedet ad dexteram Patris. Et iterum venturus est cum gloria iudicare vivos et mortuos: cuius regni non erit finis. Et in Spiritum Sanctum, Dominum et vivificantem: qui ex Patre Filioque procedit. Qui cum Patre et Filio simul adoratur et conglorificatur: qui locutus est per prophetas. Et unam, sanctam, catholicam et apostolicam Ecclesiam. Confiteor unum baptisma in remissionem peccatorum. Et exspecto resurrectionem mortuorum. Et vitam venturi saeculi. Amen.'
  },
  'Pater Noster': {
    title: 'Pater Noster',
    english: 'Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation. But deliver us from evil. Amen.',
    latin: 'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum cotidianum da nobis hodie. Et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem. Sed libera nos a malo. Amen.'
  },
  'Agnus Dei': {
    title: 'Agnus Dei',
    english: 'Lamb of God, who takest away the sins of the world, have mercy on us. Lamb of God, who takest away the sins of the world, have mercy on us. Lamb of God, who takest away the sins of the world, grant us peace.',
    latin: 'Agnus Dei, qui tollis peccata mundi, miserere nobis. Agnus Dei, qui tollis peccata mundi, miserere nobis. Agnus Dei, qui tollis peccata mundi, dona nobis pacem.'
  },
  'Sanctus': {
    title: 'Sanctus',
    english: 'Holy, Holy, Holy, Lord God of hosts. Heaven and earth are full of Thy glory. Hosanna in the highest. Blessed is He who cometh in the name of the Lord. Hosanna in the highest.',
    latin: 'Sanctus, Sanctus, Sanctus, Dominus Deus Sabaoth. Pleni sunt caeli et terra gloria tua. Hosanna in excelsis. Benedictus qui venit in nomine Domini. Hosanna in excelsis.'
  },
  'Blessing': {
    title: 'Blessing',
    english: 'May almighty God, the Father, and the Son, and the Holy Ghost, bless you.',
    latin: 'Benedicat vos omnipotens Deus, Pater, et Filius, et Spiritus Sanctus.'
  },
  'Last Gospel': {
    title: 'Last Gospel (Prologue of John)',
    english: 'In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by Him, and without Him was made nothing that was made. In Him was life, and the life was the light of men. And the light shineth in darkness, and the darkness did not comprehend it. There was a man sent from God, whose name was John. This man came for a witness, to give testimony of the light, that all men might believe through him. He was not the light, but was to give testimony of the light. That was the true light, which enlighteneth every man that cometh into this world. He was in the world, and the world was made by Him, and the world knew Him not. He came unto His own, and His own received Him not. But as many as received Him, He gave them power to be made the sons of God, to them that believe in His name: who were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God. And the Word was made flesh, and dwelt among us, and we saw His glory, the glory as it were of the only begotten of the Father, full of grace and truth.',
    latin: 'In principio erat Verbum, et Verbum erat apud Deum, et Deus erat Verbum. Hoc erat in principio apud Deum. Omnia per ipsum facta sunt, et sine ipso factum est nihil quod factum est. In ipso vita erat, et vita erat lux hominum. Et lux in tenebris lucet, et tenebrae eam non comprehenderunt. Fuit homo missus a Deo, cui nomen erat Ioannes. Hic venit in testimonium, ut testimonium perhiberet de lumine, ut omnes crederent per illum. Non erat ille lux, sed ut testimonium perhiberet de lumine. Erat lux vera, quae illuminat omnem hominem venientem in hunc mundum. In mundo erat, et mundus per ipsum factus est, et mundus eum non cognovit. In propria venit, et sui eum non receperunt. Quotquot autem receperunt eum, dedit eis potestatem filios Dei fieri, his qui credunt in nomine eius: qui non ex sanguinibus, neque ex voluntate carnis, neque ex voluntate viri, sed ex Deo nati sunt. Et Verbum caro factum est, et habitavit in nobis: et vidimus gloriam eius, gloriam quasi unigeniti a Patre, plenum gratiae et veritatis.'
  }
};

// Legacy exports for backward compatibility
export const dialogues = ordinaryDialogues;
export const prayers = ordinaryPrayers;
