import { useState } from 'react';
import Layout from '../components/Layout';
import { 
  ordinaryDialogues, 
  ordinaryPrayers, 
  extraordinaryDialogues, 
  extraordinaryPrayers 
} from '../data/massData';

type MassForm = 'ordinary' | 'extraordinary';

export default function OrderOfTheMass() {
  const [activeForm, setActiveForm] = useState<MassForm>('ordinary');
  const [expandedDialogues, setExpandedDialogues] = useState<Set<string>>(new Set());
  const [expandedPrayers, setExpandedPrayers] = useState<Set<string>>(new Set());

  const toggleDialogue = (title: string) => {
    const newExpanded = new Set(expandedDialogues);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedDialogues(newExpanded);
  };

  const togglePrayer = (title: string) => {
    const newExpanded = new Set(expandedPrayers);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedPrayers(newExpanded);
  };

  const dialogues = activeForm === 'ordinary' ? ordinaryDialogues : extraordinaryDialogues;
  const prayers = activeForm === 'ordinary' ? ordinaryPrayers : extraordinaryPrayers;

  const renderOrdinaryForm = () => (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Introductory Rites</h2>
        <p className="text-gray-600 mb-6 text-base">
          The Introductory Rites help the faithful come together as one, establish communion and prepare themselves to listen to the Word of God and to celebrate the Eucharist worthily.
        </p>
        <p className="text-gray-600 mb-6 text-base italic">
          All stand. The Priest approaches the altar with the ministers and venerates it while the Entrance Song is sung.
        </p>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Greeting')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">1.</span>
              <span className="flex-1">Sign of the Cross & Greeting</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Greeting') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Greeting') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Greeting'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Greeting'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Greeting'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Greeting'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Penitential Act')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">2.</span>
              <span className="flex-1">Penitential Act</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Penitential Act') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Penitential Act') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Penitential Act'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Penitential Act'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Penitential Act'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Penitential Act'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Kyrie')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">3.</span>
              <span className="flex-1">Kyrie Eleison (Lord, have mercy)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Kyrie') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Kyrie') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Kyrie'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Kyrie'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Gloria')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">4.</span>
              <span className="flex-1">The Gloria (on Sundays and solemnities)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Gloria') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Gloria') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Gloria'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Gloria'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">5.</span>
            <span>The Collect (Opening Prayer)</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Liturgy of the Word</h2>
        <p className="text-gray-600 mb-6 text-base">
          By hearing the word proclaimed in worship, the faithful again enter into the unending dialogue between God and the covenant people, a dialogue sealed in the sharing of the Eucharistic food and drink.
        </p>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">1.</span>
            <span>First Reading</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">2.</span>
            <span>Psalm</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">3.</span>
            <span>Second Reading (On Sundays and certain other days)</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Gospel Acclamation')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">4.</span>
              <span className="flex-1">Gospel</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Gospel Acclamation') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Gospel Acclamation') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Gospel Acclamation'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Gospel Acclamation'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Gospel Acclamation'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Gospel Acclamation'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">5.</span>
            <span>The Homily</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Creed')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">6.</span>
              <span className="flex-1">The Creed (On Sundays and Solemnities)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Creed') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Creed') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Creed'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Creed'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">7.</span>
            <span>The Prayer of the Faithful</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Liturgy of the Eucharist</h2>
        <p className="text-gray-600 mb-6 text-base">
          For Catholics, the Eucharist is the source and summit of the whole Christian life. It is the vital centre of all that the Church is and does, because at its heart is the real presence of the crucified, risen and glorified Lord, continuing and making available his saving work among us.
        </p>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">1.</span>
            <span>Preparation of the Altar and Gifts (During the Offertory Song)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">2.</span>
            <span>Prayer over the Offerings</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Preface Dialogue')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">3.</span>
              <span className="flex-1">The Eucharistic Prayer (Preface Dialogue)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Preface Dialogue') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Preface Dialogue') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Preface Dialogue'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Preface Dialogue'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Preface Dialogue'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Preface Dialogue'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Sanctus')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">4.</span>
              <span className="flex-1">Sanctus (Holy, Holy, Holy)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Sanctus') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Sanctus') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Sanctus'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Sanctus'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Memorial Acclamation')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">5.</span>
              <span className="flex-1">Memorial Acclamation</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Memorial Acclamation') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Memorial Acclamation') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Memorial Acclamation'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Memorial Acclamation'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Memorial Acclamation'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Memorial Acclamation'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Our Father')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">6.</span>
              <span className="flex-1">The Lord's Prayer</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Our Father') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Our Father') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Our Father'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Our Father'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Sign of Peace')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">7.</span>
              <span className="flex-1">Sign of Peace</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Sign of Peace') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Sign of Peace') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Sign of Peace'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Sign of Peace'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Sign of Peace'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Sign of Peace'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Agnus Dei')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">8.</span>
              <span className="flex-1">Breaking of the Bread (Agnus Dei - Lamb of God)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Agnus Dei') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Agnus Dei') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Agnus Dei'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Agnus Dei'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">9.</span>
            <span>Invitation to Communion</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">10.</span>
            <span>Communion</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">11.</span>
            <span>Prayer after Communion</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Concluding Rites</h2>
        <p className="text-gray-600 mb-6 text-base">
          The Concluding Rites send the people forth to put into effect in their lives what they have received.
        </p>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Final Blessing')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">1.</span>
              <span className="flex-1">Blessing</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Final Blessing') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Final Blessing') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed">{prayers['Final Blessing'].english}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Final Blessing'].latin}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Dismissal')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">2.</span>
              <span className="flex-1">Dismissal</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Dismissal') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Dismissal') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Dismissal'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Dismissal'].english.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Dismissal'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Dismissal'].latin.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );

  const renderExtraordinaryForm = () => (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Mass of the Catechumens</h2>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Greeting')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">1.</span>
              <span className="flex-1">Sign of the Cross</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Greeting') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Greeting') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Greeting'].latin.priest}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Greeting'].english.priest}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">2.</span>
            <span>Prayers at the Foot of the Altar</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Confiteor')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">3.</span>
              <span className="flex-1">Confiteor</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Confiteor') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Confiteor') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Confiteor'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Confiteor'].latin.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Confiteor'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Confiteor'].english.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">4.</span>
            <span>Introit</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Kyrie')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">5.</span>
              <span className="flex-1">Kyrie Eleison</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Kyrie') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Kyrie') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Kyrie'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Kyrie'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Gloria')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">6.</span>
              <span className="flex-1">Gloria in Excelsis Deo</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Gloria') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Gloria') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Gloria'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Gloria'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">7.</span>
            <span>Collect (Opening Prayer)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">8.</span>
            <span>Epistle (First Reading)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">9.</span>
            <span>Gradual and Alleluia (or Tract)</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Gospel')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">10.</span>
              <span className="flex-1">Gospel</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Gospel') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Gospel') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Gospel'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Gospel'].latin.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Gospel'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Gospel'].english.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">11.</span>
            <span>Homily</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Credo')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">12.</span>
              <span className="flex-1">Credo (Creed)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Credo') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Credo') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Credo'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Credo'].english}</p>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Mass of the Faithful</h2>
        <ul className="space-y-3 text-gray-700 text-lg">
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">1.</span>
            <span>Offertory</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">2.</span>
            <span>Offertory Prayers</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">3.</span>
            <span>Secret (Prayer over the Offerings)</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Preface')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">4.</span>
              <span className="flex-1">Preface</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Preface') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Preface') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Preface'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Preface'].latin.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Preface'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Preface'].english.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Sanctus')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">5.</span>
              <span className="flex-1">Sanctus</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Sanctus') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Sanctus') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Sanctus'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Sanctus'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">6.</span>
            <span>Canon of the Mass (Eucharistic Prayer)</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Pater Noster')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">7.</span>
              <span className="flex-1">Pater Noster (Our Father)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Pater Noster') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Pater Noster') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Pater Noster'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Pater Noster'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Agnus Dei')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">8.</span>
              <span className="flex-1">Agnus Dei</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Agnus Dei') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Agnus Dei') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Agnus Dei'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Agnus Dei'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Pax Domini')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">9.</span>
              <span className="flex-1">Pax Domini</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Pax Domini') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Pax Domini') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Pax Domini'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Pax Domini'].latin.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Pax Domini'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Pax Domini'].english.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">10.</span>
            <span>Communion</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-3">11.</span>
            <span>Postcommunion (Prayer after Communion)</span>
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => toggleDialogue('Ite Missa Est')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">12.</span>
              <span className="flex-1">Ite, Missa Est</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedDialogues.has('Ite Missa Est') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedDialogues.has('Ite Missa Est') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <div className="space-y-2 text-base">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Ite Missa Est'].latin.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Ite Missa Est'].latin.congregation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <div className="space-y-2 text-base italic">
                    <p><span className="font-medium text-primary-600">Priest:</span> {dialogues['Ite Missa Est'].english.priest}</p>
                    <p><span className="font-medium text-primary-600">Congregation:</span> {dialogues['Ite Missa Est'].english.congregation}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Blessing')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">13.</span>
              <span className="flex-1">Blessing</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Blessing') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Blessing') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Blessing'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Blessing'].english}</p>
                </div>
              </div>
            )}
          </li>
          <li className="flex flex-col">
            <button
              onClick={() => togglePrayer('Last Gospel')}
              className="flex items-center text-left hover:text-primary-600 transition-colors"
            >
              <span className="text-primary-600 mr-3">14.</span>
              <span className="flex-1">Last Gospel (Prologue of John)</span>
              <svg
                className={`w-5 h-5 ml-3 transition-transform ${expandedPrayers.has('Last Gospel') ? 'rotate-180' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedPrayers.has('Last Gospel') && (
              <div className="ml-8 mt-3 space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Latin</h4>
                  <p className="text-base leading-relaxed">{prayers['Last Gospel'].latin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">English</h4>
                  <p className="text-base leading-relaxed italic">{prayers['Last Gospel'].english}</p>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Order of the Mass</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn about the structure and order of the Catholic Mass in both the Ordinary and Extraordinary forms.
          </p>
        </div>

        {/* Form Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveForm('ordinary');
              setExpandedDialogues(new Set());
              setExpandedPrayers(new Set());
            }}
            className={`px-6 py-3 font-semibold text-lg transition-colors border-b-2 ${
              activeForm === 'ordinary'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ordinary Form (Novus Ordo)
          </button>
          <button
            onClick={() => {
              setActiveForm('extraordinary');
              setExpandedDialogues(new Set());
              setExpandedPrayers(new Set());
            }}
            className={`px-6 py-3 font-semibold text-lg transition-colors border-b-2 ${
              activeForm === 'extraordinary'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Extraordinary Form (1962 Missal)
          </button>
        </div>

        {/* Form Description */}
        {activeForm === 'ordinary' ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700 text-base">
              <strong>Ordinary Form:</strong> The Roman Missal revised and published after the Second Vatican Council. This is the form most commonly used in Catholic parishes today.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-gray-700 text-base">
              <strong>Extraordinary Form:</strong> The Roman Missal published in 1962, before the revisions following Vatican II. Also known as the Traditional Latin Mass or Tridentine Mass. Established as an extraordinary form by Pope Benedict XVI in 2007.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {activeForm === 'ordinary' ? renderOrdinaryForm() : renderExtraordinaryForm()}
        </div>
      </div>
    </Layout>
  );
}
